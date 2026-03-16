from fastapi import Depends, Request, Response

from app.dependencies.auth import get_current_user
from app.helpers.rate_limit import check_rate_limit


def _resolve_principal(user, request: Request) -> str:
    if isinstance(user, dict) and user.get("id") is not None:
        return f"user:{user['id']}"

    user_id = getattr(user, "id", None)
    if user_id is not None:
        return f"user:{user_id}"

    client_ip = request.client.host if request.client else "unknown"
    return f"ip:{client_ip}"


def _resolve_route_scope(request: Request) -> str:
    route = request.scope.get("route")
    route_path = getattr(route, "path", request.url.path)
    return f"{request.method.upper()}:{route_path}"


def _resolve_client_ip(request: Request, trust_proxy: bool = False) -> str:
    if trust_proxy:
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            first_hop = forwarded_for.split(",")[0].strip()
            if first_hop:
                return first_hop

        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            cleaned = real_ip.strip()
            if cleaned:
                return cleaned

    return request.client.host if request.client else "unknown"


def rate_limiter(limit: int, window: int, *, fail_open: bool = True):
    async def dependency(
        request: Request,
        response: Response,
        user=Depends(get_current_user),
    ):
        principal = _resolve_principal(user=user, request=request)
        route_scope = _resolve_route_scope(request=request)
        key = f"rate_limit:{principal}:{route_scope}"

        await check_rate_limit(
            key=key,
            limit=limit,
            window=window,
            response=response,
            fail_open=fail_open,
        )

    return dependency


def open_rate_limiter(
    limit: int,
    window: int,
    *,
    fail_open: bool = True,
    trust_proxy: bool = False,
    key_prefix: str = "public",
):
    async def dependency(request: Request, response: Response):
        route_scope = _resolve_route_scope(request=request)
        client_ip = _resolve_client_ip(request=request, trust_proxy=trust_proxy)
        key = f"rate_limit:{key_prefix}:ip:{client_ip}:{route_scope}"

        await check_rate_limit(
            key=key,
            limit=limit,
            window=window,
            response=response,
            fail_open=fail_open,
        )

    return dependency
