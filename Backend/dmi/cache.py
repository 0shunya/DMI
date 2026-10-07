from functools import lru_cache
import json
import logging

import redis
from redis.exceptions import RedisError

from .config import get_settings

logger = logging.getLogger(__name__)
CACHE_KEYS = ("analytics:dashboard-snapshot:v1", "analytics:skills:v1", "analytics:locations:v2", "analytics:countries:v2", "analytics:countries:v3", "analytics:location-skills:v2", "analytics:country-skills:v2")


@lru_cache
def redis_client() -> redis.Redis | None:
    url = get_settings().redis_url
    return redis.Redis.from_url(url, decode_responses=True, socket_connect_timeout=1, socket_timeout=1) if url else None


def cached(key: str, producer):
    client = redis_client()
    if client is not None:
        try:
            value = client.get(key)
            if value is not None:
                return json.loads(value)
        except RedisError:
            logger.warning("Redis cache unavailable; computing %s directly", key)
    result = producer()
    if client is not None:
        try:
            client.setex(key, 300, json.dumps(result))
        except RedisError:
            logger.warning("Redis cache write failed for %s", key)
    return result


def invalidate_analytics() -> None:
    client = redis_client()
    if client is not None:
        try:
            client.delete(*CACHE_KEYS)
        except RedisError:
            logger.warning("Redis cache invalidation failed; data will expire in five minutes")
