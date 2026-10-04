from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .config import get_settings
from .models import User, VerificationCode


def utc_datetime(value: datetime) -> datetime:
    """Treat timezone-naive SQLite values as UTC and normalize aware values."""
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def create_code(db: Session, user: User) -> str:
    now = datetime.now(timezone.utc)
    db.execute(delete(VerificationCode).where(VerificationCode.user_id == user.id))
    code = f"{secrets.randbelow(1_000_000):06d}"
    digest = hashlib.sha256(f"{get_settings().secret_key}:{code}".encode()).hexdigest()
    db.add(VerificationCode(user_id=user.id, code_hash=digest, expires_at=now + timedelta(minutes=10)))
    return code


def consume_code(db: Session, user: User, code: str) -> bool:
    now = datetime.now(timezone.utc)
    record = db.scalar(select(VerificationCode).where(VerificationCode.user_id == user.id, VerificationCode.consumed_at.is_(None)).order_by(VerificationCode.created_at.desc()))
    if record is None or utc_datetime(record.expires_at) < now or record.attempts >= 5:
        return False
    record.attempts += 1
    expected = hashlib.sha256(f"{get_settings().secret_key}:{code}".encode()).hexdigest()
    if not hmac.compare_digest(record.code_hash, expected):
        db.commit()
        return False
    record.consumed_at = now
    user.email_verified_at = now
    db.commit()
    return True
