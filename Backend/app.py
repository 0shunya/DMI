"""DMI API: persisted job intelligence and human-reviewed application tracking."""
from collections import Counter
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets
import time
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import func, or_, select, text, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from dmi.auth import current_user, hasher, make_token, throttle_auth, verify_password
from dmi.ai import draft_cover_letter
from dmi.cache import cached
from dmi.config import get_settings
from dmi.database import get_db
from dmi.email import send_verification_code
from dmi.models import Application, Job, OAuthIdentity, OAuthTicket, User
from dmi.oauth import OAuthProviderError, authorization_url, configured, exchange_code
from skill_extractor import extract_skills
from dmi.verification import consume_code, create_code

settings = get_settings()
app = FastAPI(title="Developer Market Intelligence API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

COUNTRY_NAMES = {
    "AU": "Australia", "AUS": "Australia", "AUSTRALIA": "Australia",
    "CA": "Canada", "CAN": "Canada", "CANADA": "Canada",
    "GB": "United Kingdom", "UK": "United Kingdom", "UNITED KINGDOM": "United Kingdom",
    "IN": "India", "IND": "India", "INDIA": "India",
    "US": "United States", "USA": "United States", "UNITED STATES": "United States",
}
STATE_NAMES = {
    "Australia": {"ACT": "Australian Capital Territory", "NSW": "New South Wales", "NT": "Northern Territory", "QLD": "Queensland", "SA": "South Australia", "TAS": "Tasmania", "VIC": "Victoria", "WA": "Western Australia"},
    "Canada": {"AB": "Alberta", "BC": "British Columbia", "MB": "Manitoba", "NB": "New Brunswick", "NL": "Newfoundland and Labrador", "NS": "Nova Scotia", "NT": "Northwest Territories", "NU": "Nunavut", "ON": "Ontario", "PE": "Prince Edward Island", "QC": "Quebec", "SK": "Saskatchewan", "YT": "Yukon"},
    "India": {"AP": "Andhra Pradesh", "DL": "Delhi", "GJ": "Gujarat", "KA": "Karnataka", "KL": "Kerala", "MH": "Maharashtra", "MP": "Madhya Pradesh", "PB": "Punjab", "RJ": "Rajasthan", "TN": "Tamil Nadu", "TS": "Telangana", "UP": "Uttar Pradesh", "WB": "West Bengal"},
    "United Kingdom": {"ENG": "England", "NIR": "Northern Ireland", "SCT": "Scotland", "WLS": "Wales"},
    "United States": {"AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "FL": "Florida", "GA": "Georgia", "IL": "Illinois", "MA": "Massachusetts", "MD": "Maryland", "MI": "Michigan", "MN": "Minnesota", "NC": "North Carolina", "NJ": "New Jersey", "NV": "Nevada", "NY": "New York", "OH": "Ohio", "OR": "Oregon", "PA": "Pennsylvania", "TN": "Tennessee", "TX": "Texas", "VA": "Virginia", "WA": "Washington", "WI": "Wisconsin"},
}


def display_country(value: str | None) -> str:
    raw = (value or "Not specified").strip()
    return COUNTRY_NAMES.get(raw.upper(), raw)


def display_location(location: str | None, country: str | None) -> str:
    raw = (location or "Not specified").strip()
    full_country = display_country(country)
    if raw == "Not specified":
        return raw
    parts = [part.strip() for part in raw.split(",") if part.strip()]
    if parts and parts[-1].upper() in {key for key, name in COUNTRY_NAMES.items() if name == full_country}:
        parts.pop()
    if parts:
        state = STATE_NAMES.get(full_country, {}).get(parts[-1].upper())
        if state:
            parts[-1] = state
    if not parts or (len(parts) == 1 and parts[0].upper() in COUNTRY_NAMES):
        return full_country
    return ", ".join([*parts, full_country])


def display_region(location: str | None, country: str | None) -> str:
    full_location = display_location(location, country)
    full_country = display_country(country)
    suffix = f", {full_country}"
    return full_location[:-len(suffix)] if full_location.endswith(suffix) else full_location


class Credentials(BaseModel):
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class VerificationPayload(BaseModel):
    email: EmailStr
    code: str = Field(pattern=r"^\d{6}$")


class EmailPayload(BaseModel):
    email: EmailStr


class OAuthExchange(BaseModel):
    ticket: str = Field(min_length=32, max_length=200)


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
        "location": display_location(job.location, job.country), "country": display_country(job.country),
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
    return {"id": user.id, "email": user.email, "skills": user.skills, "email_verified": user.email_verified_at is not None}


def oauth_redirect_uri(request: Request, provider: str) -> str:
    base_url = get_settings().oauth_backend_url.rstrip("/")
    if not base_url:
        base_url = str(request.base_url).rstrip("/")
    return f"{base_url}/api/auth/{provider}/callback"


def make_oauth_state(provider: str) -> str:
    nonce = secrets.token_urlsafe(24)
    issued_at = str(int(time.time()))
    payload = f"{provider}:{issued_at}:{nonce}"
    signature = hmac.new(get_settings().secret_key.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{provider}.{issued_at}.{nonce}.{signature}"


def valid_oauth_state(state: str, provider: str) -> bool:
    try:
        state_provider, issued_at, nonce, signature = state.split(".", 3)
        age = time.time() - int(issued_at)
    except ValueError:
        return False
    expected = hmac.new(get_settings().secret_key.encode(), f"{provider}:{issued_at}:{nonce}".encode(), hashlib.sha256).hexdigest()
    return state_provider == provider and -60 <= age <= 600 and hmac.compare_digest(signature, expected)


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
    return cached("analytics:skills:v1", produce)


@app.get("/api/locations")
def get_locations(db: Session = Depends(get_db)):
    def produce():
        counts = Counter((display_location(job.location, job.country), display_country(job.country)) for job in all_jobs(db) if job.location != "Not specified")
        return [{"location": name, "country": country, "jobs": amount} for (name, country), amount in counts.most_common()]
    return cached("analytics:locations:v2", produce)


@app.get("/api/countries")
def get_countries(db: Session = Depends(get_db)):
    def produce():
        grouped: dict[str, dict[str, object]] = {}
        for job in all_jobs(db):
            country = job.country or "Not specified"
            record = grouped.setdefault(country, {"jobs": 0, "regions": set()})
            record["jobs"] = int(record["jobs"]) + 1
            if job.location != "Not specified":
                record["regions"].add(display_region(job.location, job.country))
        return [
            {"country": display_country(country), "jobs": int(record["jobs"]), "regions": sorted(record["regions"])}
            for country, record in sorted(grouped.items(), key=lambda item: (-int(item[1]["jobs"]), item[0]))
        ]
    return cached("analytics:countries:v3", produce)


@app.get("/api/location-skills")
def get_location_skills(db: Session = Depends(get_db)):
    def produce():
        result: dict[str, Counter] = {}
        for job in all_jobs(db):
            if job.location != "Not specified":
                result.setdefault(display_location(job.location, job.country), Counter()).update(extract_skills(f"{job.title} {job.description}"))
        return {location: dict(counts) for location, counts in result.items()}
    return cached("analytics:location-skills:v2", produce)


@app.get("/api/country-skills")
def get_country_skills(db: Session = Depends(get_db)):
    def produce():
        result: dict[str, Counter] = {}
        for job in all_jobs(db):
            result.setdefault(display_country(job.country), Counter()).update(extract_skills(f"{job.title} {job.description}"))
        return {country: dict(counts) for country, counts in result.items()}
    return cached("analytics:country-skills:v2", produce)


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
    code = create_code(db, user)
    db.commit()
    try:
        send_verification_code(user.email, code)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"verification_required": True, "email": user.email, "message": "Check your email for the six-digit verification code."}


@app.post("/api/auth/verify-email")
def verify_email(payload: VerificationPayload, request: Request, db: Session = Depends(get_db)):
    throttle_auth(request)
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if user is None or not consume_code(db, user, payload.code):
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    return {"access_token": make_token(user.id), "user": profile_record(user)}


@app.post("/api/auth/resend-verification")
def resend_verification(payload: EmailPayload, request: Request, db: Session = Depends(get_db)):
    throttle_auth(request)
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))
    if user is None or user.email_verified_at is not None:
        return {"message": "If that account needs verification, a new code was sent."}
    code = create_code(db, user)
    db.commit()
    try:
        send_verification_code(user.email, code)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"message": "If that account needs verification, a new code was sent."}


@app.post("/api/auth/login")
def login(payload: Credentials, request: Request, db: Session = Depends(get_db)):
    email = str(payload.email).lower()
    throttle_auth(request)
    user = db.scalar(select(User).where(User.email == email))
    if not user or user.password_hash is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.email_verified_at is None:
        raise HTTPException(status_code=403, detail="Email verification required")
    return {"access_token": make_token(user.id), "user": profile_record(user)}


@app.get("/api/auth/{provider}/start")
def oauth_start(provider: Literal["google", "github"], request: Request):
    if not configured(provider):
        raise HTTPException(status_code=503, detail=f"{provider.title()} sign-in is not configured")
    try:
        state = make_oauth_state(provider)
        url = authorization_url(provider, state, oauth_redirect_uri(request, provider))
    except OAuthProviderError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    response = RedirectResponse(url, status_code=302)
    response.set_cookie("dmi_oauth_state", state, max_age=600, httponly=True, secure=settings.environment == "production", samesite="lax", path="/api/auth")
    return response


@app.get("/api/auth/{provider}/callback")
def oauth_callback(provider: Literal["google", "github"], request: Request, code: str = "", state: str = "", db: Session = Depends(get_db)):
    state_cookie = request.cookies.get("dmi_oauth_state", "")
    if not code or not hmac.compare_digest(state, state_cookie) or not valid_oauth_state(state, provider):
        raise HTTPException(status_code=400, detail="Invalid OAuth callback")
    try:
        subject, email = exchange_code(provider, code, oauth_redirect_uri(request, provider))
    except OAuthProviderError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    identity = db.scalar(select(OAuthIdentity).where(OAuthIdentity.provider == provider, OAuthIdentity.subject == subject))
    user = db.get(User, identity.user_id) if identity else db.scalar(select(User).where(User.email == email))
    if user is None:
        user = User(email=email, password_hash=None, skills=[], email_verified_at=datetime.now(timezone.utc))
        db.add(user)
        db.flush()
    elif identity is None and user.password_hash is not None:
        raise HTTPException(status_code=409, detail="An account already uses this email. Sign in with email first, then link OAuth from your account.")
    elif user.email_verified_at is None:
        user.email_verified_at = datetime.now(timezone.utc)
    if identity is None:
        db.add(OAuthIdentity(user_id=user.id, provider=provider, subject=subject, provider_email=email))
    db.commit()

    raw_ticket = secrets.token_urlsafe(32)
    db.add(OAuthTicket(token_hash=hashlib.sha256(raw_ticket.encode()).hexdigest(), user_id=user.id, expires_at=datetime.now(timezone.utc) + timedelta(minutes=2)))
    db.commit()
    destination = f"{get_settings().frontend_url.rstrip('/')}/auth/callback?ticket={raw_ticket}"
    response = RedirectResponse(destination, status_code=302)
    response.delete_cookie("dmi_oauth_state", path="/api/auth")
    return response


@app.post("/api/auth/oauth/exchange")
def oauth_exchange(payload: OAuthExchange, db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    token_hash = hashlib.sha256(payload.ticket.encode()).hexdigest()
    ticket = db.scalar(select(OAuthTicket).where(OAuthTicket.token_hash == token_hash))
    if ticket is None:
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth ticket")
    redeemed = db.execute(update(OAuthTicket).where(OAuthTicket.id == ticket.id, OAuthTicket.used_at.is_(None), OAuthTicket.expires_at >= now).values(used_at=now))
    if redeemed.rowcount != 1:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid or expired OAuth ticket")
    user = db.get(User, ticket.user_id)
    db.commit()
    if user is None:
        raise HTTPException(status_code=400, detail="OAuth account no longer exists")
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
        draft, draft_source = draft_cover_letter(job, user)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {
        "draft": draft,
        "source": draft_source,
        "review_required": True,
        "notice": f"{draft_source.title()}; verify every claim before using it. DMI never submits applications.",
    }
