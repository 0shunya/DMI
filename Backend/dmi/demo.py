"""Optional illustrative listings; never represented as real job opportunities."""
from hashlib import sha256
from sqlalchemy import select

from .database import SessionLocal
from .models import Job
from .cache import invalidate_analytics

ROWS = [
    ("Backend Engineer", "Sample Studio A", "Bengaluru", "India", "Python Django PostgreSQL Docker AWS REST API"),
    ("Frontend Engineer", "Sample Studio B", "Pune", "India", "React TypeScript JavaScript Git REST API"),
    ("Platform Engineer", "Sample Studio C", "Hyderabad", "India", "Kubernetes Docker AWS Python Git"),
    ("Full-stack Developer", "Sample Studio D", "Toronto", "Canada", "React Node.js PostgreSQL TypeScript"),
    ("Data Engineer", "Sample Studio E", "Austin", "USA", "Python SQL AWS PostgreSQL"),
    ("Software Engineer", "Sample Studio F", "London", "UK", "Java Spring Boot Docker Kubernetes"),
    ("Cloud Developer", "Sample Studio G", "Sydney", "Australia", "Azure C# ASP.NET SQL"),
]


def seed() -> int:
    created = 0
    with SessionLocal() as db:
        for index, (title, company, location, country, skills) in enumerate(ROWS, start=1):
            url = f"https://example.org/dmi-demo/{index}"
            digest = sha256(url.encode()).hexdigest()
            if db.scalar(select(Job).where(Job.url_hash == digest)):
                continue
            db.add(Job(
                url_hash=digest, job_url=url, title=title, company=company,
                location=location, country=country, description=f"Illustrative role for exploring DMI. Skills: {skills}.",
                source="demo", date_posted="Demo listing",
            ))
            created += 1
        db.commit()
    if created:
        invalidate_analytics()
    print(f"Added {created} clearly labeled demo listings")
    return created


if __name__ == "__main__":
    seed()
