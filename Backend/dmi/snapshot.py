"""Precomputed PostgreSQL dashboard snapshots shared by all API users."""
from collections import Counter
from datetime import datetime, timezone

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from skill_extractor import extract_skills

from .models import DashboardSnapshot, Job

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


def build_dashboard_payload(db: Session) -> dict:
    jobs = list(db.scalars(select(Job)).all())
    latest = max((job.scraped_at for job in jobs), default=None)
    demo_count = sum(1 for job in jobs if job.source == "demo")
    skill_counts = Counter(skill for job in jobs for skill in extract_skills(f"{job.title} {job.description}"))
    location_counts = Counter((display_location(job.location, job.country), display_country(job.country)) for job in jobs if job.location != "Not specified")
    grouped: dict[str, dict[str, object]] = {}
    location_skills: dict[str, Counter] = {}
    country_skills: dict[str, Counter] = {}
    for job in jobs:
        country = job.country or "Not specified"
        record = grouped.setdefault(country, {"jobs": 0, "regions": set()})
        record["jobs"] = int(record["jobs"]) + 1
        if job.location != "Not specified":
            record["regions"].add(display_region(job.location, job.country))
            location_skills.setdefault(display_location(job.location, job.country), Counter()).update(extract_skills(f"{job.title} {job.description}"))
        country_skills.setdefault(display_country(country), Counter()).update(extract_skills(f"{job.title} {job.description}"))
    countries = [
        {"country": display_country(country), "jobs": int(record["jobs"]), "regions": sorted(record["regions"])}
        for country, record in sorted(grouped.items(), key=lambda item: (-int(item[1]["jobs"]), item[0]))
    ]
    return {
        "status": {
            "total": len(jobs), "demo_count": demo_count,
            "updated_at": latest.isoformat() if latest else None,
            "note": "Job-board results may be incomplete or delayed; demo records are illustrative.",
        },
        "skills": [{"skill": name, "jobs": amount} for name, amount in skill_counts.most_common()],
        "locations": [{"location": name, "country": country, "jobs": amount} for (name, country), amount in location_counts.most_common()],
        "countries": countries,
        "location_skills": {location: dict(counts) for location, counts in location_skills.items()},
        "country_skills": {country: dict(counts) for country, counts in country_skills.items()},
    }


def publish_dashboard_snapshot(db: Session) -> dict:
    payload = build_dashboard_payload(db)
    latest_version = db.scalar(select(func.max(DashboardSnapshot.version))) or 0
    db.execute(update(DashboardSnapshot).where(DashboardSnapshot.is_active.is_(True)).values(is_active=False))
    db.add(DashboardSnapshot(version=latest_version + 1, payload=payload, is_active=True, created_at=datetime.now(timezone.utc)))
    db.commit()
    return payload


def active_dashboard_snapshot(db: Session) -> dict:
    snapshot = db.scalar(select(DashboardSnapshot).where(DashboardSnapshot.is_active.is_(True)).order_by(DashboardSnapshot.version.desc()).limit(1))
    return snapshot.payload if snapshot else publish_dashboard_snapshot(db)
