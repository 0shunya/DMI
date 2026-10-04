"""Run one production job refresh and exit.

This is used by GitHub Actions so free hosting does not need an always-on worker.
"""
import logging

from dmi.database import SessionLocal
from dmi.ingestion import refresh_jobs

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)


if __name__ == "__main__":
    with SessionLocal() as db:
        count = refresh_jobs(db)
    logger.info("Scheduled ingestion finished; %s job records refreshed", count)
