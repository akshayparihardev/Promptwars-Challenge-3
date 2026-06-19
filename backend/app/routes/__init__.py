"""Routes sub-package."""

from app.routes.calculate import router as calculate_router
from app.routes.entries import router as entries_router
from app.routes.health import router as health_router
from app.routes.insights import router as insights_router
from app.routes.whatif import router as whatif_router

__all__ = [
    "calculate_router",
    "entries_router",
    "health_router",
    "insights_router",
    "whatif_router",
]
