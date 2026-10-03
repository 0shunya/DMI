from hashlib import sha256

from fastapi.testclient import TestClient
import pandas as pd
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app import app
from dmi.database import Base, get_db
from dmi.ingestion import ingest_frame
from dmi.models import Job
from skill_extractor import extract_skills


@pytest.fixture
def context():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)

    def override_db():
        with session() as db:
            yield db

    app.dependency_overrides[get_db] = override_db
    with TestClient(app) as client:
        yield client, session
    app.dependency_overrides.clear()
    engine.dispose()


def add_job(session, url="https://example.com/jobs/1", title="Python Engineer", description="Python, C++, Docker"):
    with session() as db:
        job = Job(url_hash=sha256(url.encode()).hexdigest(), job_url=url,
                  title=title, company="Example", location="Pune", country="India",
                  description=description, date_posted="2026-10-01", source="demo")
        db.add(job)
        db.commit()
        return job.id


def register(client, email="one@example.com"):
    result = client.post("/api/auth/register", json={"email": email, "password": "safe password 1234"})
    assert result.status_code == 201, result.text
    return {"Authorization": f"Bearer {result.json()['access_token']}"}


def test_health_and_empty_state(context):
    client, _ = context
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/api/jobs").json() == []
    assert client.get("/api/data-status").json()["total"] == 0
    assert client.get("/api/country-skills").json() == {}
    assert client.get("/api/applications").status_code == 401


def test_registration_login_and_validation(context):
    client, _ = context
    headers = register(client)
    assert client.get("/api/me", headers=headers).json()["email"] == "one@example.com"
    assert client.post("/api/auth/login", json={"email": "one@example.com", "password": "safe password 1234"}).status_code == 200
    assert client.post("/api/auth/login", json={"email": "one@example.com", "password": "incorrect value"}).status_code == 401
    assert client.post("/api/auth/register", json={"email": "ONE@example.com", "password": "safe password 1234"}).status_code == 409
    assert client.post("/api/auth/register", json={"email": "bad", "password": "short"}).status_code == 422
    assert client.get("/api/me", headers={"Authorization": "Bearer nonsense"}).status_code == 401


def test_tracking_is_per_user_and_match_explains_score(context):
    client, session = context
    job_id = add_job(session)
    first = register(client)
    other = register(client, "other@example.com")
    assert client.patch("/api/me", json={"skills": ["Python", "Docker"]}, headers=first).status_code == 200
    match = client.get(f"/api/jobs/{job_id}/match", headers=first).json()
    assert match["score"] == 67
    assert match["matched"] == ["Python", "Docker"]
    assert match["missing"] == ["C++"]
    assert "not an AI" in match["method"]
    saved = client.post("/api/applications", json={"job_id": job_id}, headers=first)
    assert saved.status_code == 201, saved.text
    item_id = saved.json()["id"]
    assert client.post("/api/applications", json={"job_id": job_id}, headers=first).status_code == 409
    assert client.get("/api/applications", headers=other).json() == []
    assert client.patch(f"/api/applications/{item_id}", json={"status": "applied"}, headers=other).status_code == 404
    updated = client.patch(f"/api/applications/{item_id}", json={"status": "interview", "notes": "Follow up next week"}, headers=first)
    assert updated.json()["notes"] == "Follow up next week"
    assert client.patch(f"/api/applications/{item_id}", json={"status": "invalid"}, headers=first).status_code == 422
    assert client.delete(f"/api/applications/{item_id}", headers=other).status_code == 404
    assert client.delete(f"/api/applications/{item_id}", headers=first).status_code == 204


def test_cover_letter_requires_explicit_local_ai(context):
    client, session = context
    job_id = add_job(session)
    headers = register(client)
    response = client.post(f"/api/jobs/{job_id}/draft-cover-letter", headers=headers)
    assert response.status_code == 503
    assert "OLLAMA_URL" in response.json()["detail"]


def test_analytics_and_query(context):
    client, session = context
    add_job(session)
    add_job(session, url="https://example.com/jobs/2", title="React Developer", description="React and TypeScript")
    assert len(client.get("/api/jobs", params={"q": "Python"}).json()) == 1
    assert len(client.get("/api/jobs", params={"country": "India"}).json()) == 2
    assert client.get("/api/jobs", params={"limit": 101}).status_code == 422
    assert client.get("/api/locations").json() == [{"location": "Pune", "jobs": 2}]
    assert client.get("/api/country-skills").json()["India"]["C++"] == 1
    assert client.get("/api/data-status").json()["demo_count"] == 2


def test_ingestion_deduplicates_and_rejects_bad_urls(context):
    _, session = context
    frame = pd.DataFrame([
        {"job_url": "https://example.com/jobs/a", "title": "Engineer", "company": "A", "description": "Python"},
        {"job_url": "javascript:alert(1)", "title": "Bad"},
    ])
    with session() as db:
        assert ingest_frame(db, frame) == 1
        assert ingest_frame(db, frame) == 1
        assert len(db.scalars(select(Job)).all()) == 1


def test_punctuation_skills():
    assert "C++" in extract_skills("C++ engineering")
    assert "C#" in extract_skills("C# and .NET")
    assert "Java" not in extract_skills("JavaScript")
