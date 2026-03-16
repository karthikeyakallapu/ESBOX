from dataclasses import dataclass
from typing import Optional

from fastapi import HTTPException, Response, status
from redis.exceptions import RedisError
from starlette.concurrency import run_in_threadpool

from app.logger import logger
from app.services.redis.RedisService import redis_service


_FIXED_WINDOW_LUA = """
local current = redis.call('INCRBY', KEYS[1], tonumber(ARGV[1]))
if current == tonumber(ARGV[1]) then
  redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2]))
end
local ttl = redis.call('TTL', KEYS[1])
if ttl < 0 then
  redis.call('EXPIRE', KEYS[1], tonumber(ARGV[2]))
  ttl = tonumber(ARGV[2])
end
return {current, ttl}
"""

_fixed_window_script = redis_service.get_client().register_script(_FIXED_WINDOW_LUA)


@dataclass(frozen=True)
class RateLimitResult:
    allowed: bool
    limit: int
    current: int
    remaining: int
    reset_after_seconds: int


def _validate_inputs(key: str, limit: int, window: int, increment: int) -> None:
    if not isinstance(key, str) or not key.strip():
        raise ValueError("Rate-limit key must be a non-empty string")
    if limit <= 0:
        raise ValueError("Rate-limit limit must be > 0")
    if window <= 0:
        raise ValueError("Rate-limit window must be > 0")
    if increment <= 0:
        raise ValueError("Rate-limit increment must be > 0")


def _build_headers(result: RateLimitResult, include_retry_after: bool) -> dict[str, str]:
    headers = {
        "X-RateLimit-Limit": str(result.limit),
        "X-RateLimit-Remaining": str(result.remaining),
        "X-RateLimit-Reset": str(result.reset_after_seconds),
    }
    if include_retry_after:
        headers["Retry-After"] = str(max(result.reset_after_seconds, 1))
    return headers


async def _consume_token(key: str, increment: int, window: int) -> tuple[int, int]:
    def _execute() -> tuple[int, int]:
        raw = _fixed_window_script(
            keys=[key],
            args=[increment, window],
            client=redis_service.get_client()
        )
        if not isinstance(raw, (list, tuple)) or len(raw) != 2:
            raise RuntimeError("Unexpected Redis script response for rate limiter")
        return int(raw[0]), int(raw[1])

    return await run_in_threadpool(_execute)


async def check_rate_limit(
    key: str,
    limit: int,
    window: int,
    response: Optional[Response] = None,
    fail_open: bool = True,
    increment: int = 1,
) -> RateLimitResult:
    _validate_inputs(key=key, limit=limit, window=window, increment=increment)

    try:
        current, ttl = await _consume_token(key=key, increment=increment, window=window)
    except RedisError as exc:
        logger.error("Rate limiter Redis error for key %s: %s", key, exc)
        if fail_open:
            return RateLimitResult(
                allowed=True,
                limit=limit,
                current=0,
                remaining=limit,
                reset_after_seconds=window,
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Rate limiter unavailable",
        ) from exc
    except Exception as exc:
        logger.error("Rate limiter error for key %s: %s", key, exc)
        if fail_open:
            return RateLimitResult(
                allowed=True,
                limit=limit,
                current=0,
                remaining=limit,
                reset_after_seconds=window,
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Rate limiter unavailable",
        ) from exc

    result = RateLimitResult(
        allowed=current <= limit,
        limit=limit,
        current=current,
        remaining=max(limit - current, 0),
        reset_after_seconds=max(ttl, 0),
    )

    headers = _build_headers(result=result, include_retry_after=not result.allowed)

    if response is not None:
        for header_name, header_value in headers.items():
            response.headers[header_name] = header_value

    if not result.allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests",
            headers=headers,
        )

    return result
