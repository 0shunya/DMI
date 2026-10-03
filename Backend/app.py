"""DMI API: persisted job intelligence and human-reviewed application tracking."""
from collections import Counter
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, or_, select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from dmi.auth import current_user, hasher, make_token, throttle_auth, verify_password
from dmi.ai import draft_cover_letter
from dmi.cache import cached
from dmi.config import get_settings
from dmi.database import get_db
from dmi.models import Application, Job, User
from skill_extractor import extract_skills

settings = get_settings()
app = FastAPI(title="Developer Market Intelligence API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class ProfileUpdate(BaseModel):
    skills: list[str] = Field(max_length=40)


class ApplicationCreate(BaseModel):
    job_id: int = Field(gt=0)


class ApplicationUpdate(BaseModel):
    status: Literal["saved", "applied", "interview", "offer", "rejected"] | None = None
    notes: str | None = Field(default=None, max_length=2000)


def job_record(job: Job) -> dict:
    return {
        "id": job.id, "title": job.title, "company": job.company,
        "location": job.location, "country": job.country,
        "job_url": job.job_url, "description": job.description,
        "date_posted": job.date_posted, "scraped_at": job.scraped_at.isoformat(),
        "source": job.source,
    }


def application_record(item: Application) -> dict:
    return {
        "id": item.id, "status": item.status, "notes": item.notes,
        "updated_at": item.updated_at.isoformat(), "job": job_record(item.job),
    }


def profile_record(user: User) -> dict:
    return {"id": user.id, "email": user.email, "skills": user.skills}


@app.get("/")
def home():
    return {"message": "DevMarket Intelligence API is running", "docs": "/docs"}


@app.get("/health")
def health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Database unavailable") from exc
    return {"status": "ok"}


@app.get("/api/data-status")
def data_status(db: Session = Depends(get_db)):
    total = db.scalar(select(func.count()).select_from(Job)) or 0
    latest = db.scalar(select(func.max(Job.scraped_at)))
    demo_count = db.scalar(select(func.count()).select_from(Job).where(Job.source == "demo")) or 0
    return {
        "total": total, "demo_count": demo_count,
        "updated_at": latest.isoformat() if latest else None,
        "note": "Job-board results may be incomplete or delayed; demo records are illustrative.",
    }


@app.get("/api/jobs")
def get_jobs(
    q: str = Query(default="", max_length=100),
    country: str = Query(default="", max_length=60),
    limit: int = Query(default=50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    stmt = select(Job)
    if q.strip():
        query = f"%{q.strip()}%"
        stmt = stmt.where(or_(Job.title.ilike(query), Job.company.ilike(query), Job.description.ilike(query)))
    if country.strip():
        stmt = stmt.where(Job.country == country.strip())
    jobs = db.scalars(stmt.order_by(Job.scraped_at.desc(), Job.id.desc()).limit(limit)).all()
    return [job_record(job) for job in jobs]


def all_jobs(db: Session) -> list[Job]:
    return list(db.scalars(select(Job)).all())


@app.get("/api/skills")
def get_skills(db: Session = Depends(get_db)):
    def produce():
        counts = Counter(skill for job in all_jobs(db) for skill in extract_skills(f"{job.title} {job.description}"))
        return [{"skill": name, "jobs": amount} for name, amount in counts.most_common()]
    return cached("analytics:skills", produce)


@app.get("/api/locations")
def get_locations(db: Session = Depends(get_db)):
    def produce():
        counts = Counter(job.location for job in all_jobs(db) if job.location != "Not specified")
        return [{"location": name, "jobs": amount} for name, amount in counts.most_common()]
    return cached("analytics:locations", produce)


@app.get("/api/location-skills")
def get_location_skills(db: Session = Depends(get_db)):
    def produce():
        result: dict[str, Counter] = {}
        for job in all_jobs(db):
            if job.location != "Not specified":
                result.setdefault(job.location, Counter()).update(extract_skills(f"{job.title} {job.description}"))
        return {location: dict(counts) for location, counts in result.items()}
    return cached("analytics:location-skills", produce)


@app.get("/api/country-skills")
def get_country_skills(db: Session = Depends(get_db)):
    def produce():
        result: dict[str, Counter] = {}
        for job in all_jobs(db):
            result.setdefault(job.country, Counter()).update(extract_skills(f"{job.title} {job.description}"))
        return {country: dict(counts) for country, counts in result.items()}
    return cached("analytics:country-skills", produce)


@app.post("/api/auth/register", status_code=201)
def register(payload: Credentials, request: Request, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    throttle_auth(request)
    user = User(email=email, password_hash=hasher.hash(payload.password), skills=[])
    db.add(user)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email already registered") from exc
    db.refresh(user)
    return {"access_token": make_token(user.id), "user": profile_record(user)}


@app.post("/api/auth/login")
def login(payload: Credentials, request: Request, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    throttle_auth(request)
    user = db.scalar(select(User).where(User.email == email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": make_token(user.id), "user": profile_record(user)}


@app.get("/api/me")
def get_profile(user: User = Depends(current_user)):
    return profile_record(user)


@app.patch("/api/me")
def update_profile(
    payload: ProfileUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    skills = list(dict.fromkeys(skill.strip()[:60] for skill in payload.skills if skill.strip()))
    user.skills = skills
    db.commit()
    return profile_record(user)


@app.get("/api/applications")
def get_applications(user: User = Depends(current_user), db: Session = Depends(get_db)):
    items = db.scalars(
        select(Application).where(Application.user_id == user.id).order_by(Application.updated_at.desc())
    ).all()
    return [application_record(item) for item in items]


@app.post("/api/applications", status_code=201)
def save_application(
    payload: ApplicationCreate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    job = db.get(Job, payload.job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    item = Application(user_id=user.id, job_id=job.id, status="saved")
    db.add(item)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=409, detail="Job already saved") from exc
    db.refresh(item)
    return application_record(item)


@app.patch("/api/applications/{application_id}")
def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    item = db.scalar(select(Application).where(Application.id == application_id, Application.user_id == user.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Application not found")
    if payload.status is not None:
        item.status = payload.status
    if payload.notes is not None:
        item.notes = payload.notes
    db.commit()
    db.refresh(item)
    return application_record(item)


@app.delete("/api/applications/{application_id}", status_code=204)
def delete_application(application_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    item = db.scalar(select(Application).where(Application.id == application_id, Application.user_id == user.id))
    if item is None:
        raise HTTPException(status_code=404, detail="Application not found")
    db.delete(item)
    db.commit()


@app.get("/api/jobs/{job_id}/match")
def match_job(job_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    required = extract_skills(f"{job.title} {job.description}")
    mine = {skill.casefold() for skill in user.skills}
    matched = [skill for skill in required if skill.casefold() in mine]
    missing = [skill for skill in required if skill.casefold() not in mine]
    return {
        "score": round(100 * len(matched) / len(required)) if required else None,
        "matched": matched, "missing": missing,
        "method": "Explainable keyword overlap; not an AI assessment or hiring prediction.",
    }


@app.post("/api/jobs/{job_id}/draft-cover-letter")
def cover_letter_draft(job_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    try:
        draft = draft_cover_letter(job, user)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {
        "draft": draft,
        "review_required": True,
        "notice": "AI-generated draft; verify every claim before using it. DMI never submits applications.",
    }
