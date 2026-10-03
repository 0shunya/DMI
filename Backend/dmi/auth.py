from datetime import datetime, timedelta, timezone
import logging

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from jwt import InvalidTokenError
from redis.exceptions import RedisError
from sqlalchemy.orm import Session

from .config import get_settings
from .database import get_db
from .models import User
from .cache import redis_client

hasher = PasswordHasher()
bearer = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)


def make_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    return jwt.encode(
        {"sub": str(user_id), "iat": now, "exp": now + timedelta(hours=24)},
        get_settings().secret_key,
        algorithm="HS256",
    )


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError):
        return False


def current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in required")
    try:
        payload = jwt.decode(credentials.credentials, get_settings().secret_key, algorithms=["HS256"])
        user_id = int(payload["sub"])
    except (InvalidTokenError, KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired session") from exc
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return user


def throttle_auth(request: Request) -> None:
    client = redis_client()
    if client is None:
        return
    address = request.client.host if request.client else "unknown"
    # Rate-limit per IP; this instance is only exposed behind the bundled reverse proxy.
    key = f"auth-attempts:{address}"
    try:
        attempts = client.incr(key)
        if attempts == 1:
            client.expire(key, 300)
        if attempts > 15:
            raise HTTPException(status_code=429, detail="Too many attempts; try again later")
    except RedisError:
        logger.warning("Redis unavailable for login throttling")
