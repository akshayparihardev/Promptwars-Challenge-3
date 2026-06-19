"""FastAPI application entry point.

Wires together: security middleware (restrictive CORS + hardening headers), the
API routers, rate limiting, and — in production — static serving of the built React SPA so the
whole platform runs as a single Cloud Run container.
"""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from pathlib import Path

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app import __version__
from app.config import get_settings
from app.routes import calculate, entries, health, insights, whatif

# Directory holding the built frontend (populated by the Docker build).
_STATIC_DIR = Path(__file__).resolve().parent.parent / "static"

# Security response headers applied to every response (defense in depth).
_SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": (
        "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; "
        "script-src 'self'; connect-src 'self'; base-uri 'self'; frame-ancestors 'none'"
    ),
}

# Rate Limiter based on IP
limiter = Limiter(key_func=get_remote_address)


def create_app() -> FastAPI:
    """Build the FastAPI application: middleware, routers, and SPA mount."""
    settings = get_settings()
    app = FastAPI(
        title="Carbon Footprint Awareness Platform",
        version=__version__,
        description="Understand, track, and reduce your carbon footprint.",
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)  # type: ignore

    # CORS — restricted to configured origins (SPA is same-origin in production).
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.origins_list,
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.middleware("http")
    async def security_headers(
        request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        response = await call_next(request)
        for key, value in _SECURITY_HEADERS.items():
            response.headers.setdefault(key, value)
        return response

    # Mount routers
    app.include_router(health.router, prefix="/api")
    app.include_router(calculate.router, prefix="/api")
    app.include_router(insights.router, prefix="/api")
    app.include_router(whatif.router, prefix="/api")
    app.include_router(entries.router, prefix="/api")

    _mount_spa(app)
    return app


def _mount_spa(app: FastAPI) -> None:
    """Serve the built SPA (if present) with client-side-routing fallback."""
    if not _STATIC_DIR.exists():
        return

    assets = _STATIC_DIR / "assets"
    if assets.exists():
        app.mount("/assets", StaticFiles(directory=assets), name="assets")

    index = _STATIC_DIR / "index.html"

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa(full_path: str) -> Response:
        # API 404s should stay JSON, not fall through to index.html.
        if full_path.startswith("api/"):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        candidate = _STATIC_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(index)


app = create_app()
