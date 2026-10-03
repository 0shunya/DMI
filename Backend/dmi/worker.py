import logging
import signal
import threading

from .config import get_settings
from .database import SessionLocal
from .ingestion import refresh_jobs

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger(__name__)
stopped = threading.Event()


def main() -> None:
    signal.signal(signal.SIGTERM, lambda *_: stopped.set())
    signal.signal(signal.SIGINT, lambda *_: stopped.set())
    interval = max(get_settings().scrape_interval_seconds, 900)
    while not stopped.is_set():
        try:
            with SessionLocal() as db:
                count = refresh_jobs(db)
            logger.info("Ingestion complete; %s job records refreshed", count)
            stopped.wait(interval if count else 900)
        except Exception:
            logger.exception("Ingestion failed; keeping existing job data")
            stopped.wait(60)


if __name__ == "__main__":
    main()
