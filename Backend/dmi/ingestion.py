from datetime import datetime, timezone
import hashlib
import logging
from urllib.parse import urlparse

import pandas as pd
from sqlalchemy import select
from sqlalchemy.orm import Session

from scraper import scrape_multiple_countries
from .cache import invalidate_analytics
from .models import Job
from .snapshot import publish_dashboard_snapshot

logger = logging.getLogger(__name__)


def clean(value, limit: int = 10000) -> str:
    if value is None or not isinstance(value, (str, int, float, datetime)):
        return ""
    if not isinstance(value, str) and pd.isna(value):
        return ""
    text = str(value).strip()
    return "" if text.lower() in {"nan", "nat", "none"} else text[:limit]


def ingest_frame(db: Session, frame: pd.DataFrame) -> int:
    if frame.empty:
        return 0
    count = 0
    now = datetime.now(timezone.utc)
    for record in frame.to_dict("records"):
        url = clean(record.get("job_url"), 2048)
        parsed = urlparse(url)
        if parsed.scheme not in {"https", "http"} or not parsed.netloc:
            continue
        url_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
        job = db.scalar(select(Job).where(Job.url_hash == url_hash))
        if job is None:
            job = Job(url_hash=url_hash, job_url=url)
            db.add(job)
        job.title = clean(record.get("title"), 250) or "Untitled role"
        job.company = clean(record.get("company"), 250) or "Unknown company"
        job.location = clean(record.get("location"), 250) or "Not specified"
        job.country = clean(record.get("country"), 60) or "India"
        job.description = clean(record.get("description"), 20000)
        job.source = "scraped"
        job.date_posted = clean(record.get("date_posted"), 50)
        job.scraped_at = now
        count += 1
    db.commit()
    if count:
        invalidate_analytics()
        publish_dashboard_snapshot(db)
    return count


def refresh_jobs(db: Session) -> int:
    """Scrape outside HTTP requests; keep last successful snapshot on failure."""
    frame = scrape_multiple_countries(results_per_country=20)
    if frame.empty:
        logger.warning("Scraper returned no jobs; preserving previously stored results")
        return 0
    return ingest_frame(db, frame)
