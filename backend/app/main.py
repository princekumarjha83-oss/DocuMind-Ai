from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.api.v1.api import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.request_id import RequestIdMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist on startup (skip during isolated pytest runs)
    if not getattr(app.state, "testing", False):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield
    # Cleanup on shutdown
    if not getattr(app.state, "testing", False):
        await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Universal Document Intelligence & RAG Workspace Backend API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan
)

# Correlation ID and Security Headers Middleware
app.add_middleware(RequestIdMiddleware)
app.add_middleware(SecurityHeadersMiddleware)

# CORS Configuration (allows configured origins, FRONTEND_URL, and all Vercel deployments)
cors_origins = list(settings.BACKEND_CORS_ORIGINS)
if settings.FRONTEND_URL and settings.FRONTEND_URL not in cors_origins:
    cors_origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.db.mongodb import mongodb_manager

# Include API v1 Routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
async def liveness_check():
    """Liveness probe confirming API process is running."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }

@app.get("/health/ready", tags=["Health"])
async def readiness_check():
    """Readiness probe checking database connectivity and core services."""
    from sqlalchemy import text
    from app.db.session import async_session_maker

    sql_ok = False
    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
            sql_ok = True
    except Exception as e:
        sql_ok = False

    mongo_status = "not_configured"
    if settings.MONGODB_URL:
        mongo_ok = await mongodb_manager.ping()
        mongo_status = "connected" if mongo_ok else "unreachable"

    overall_ready = sql_ok

    status_code = status.HTTP_200_OK if overall_ready else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(
        status_code=status_code,
        content={
            "status": "ready" if overall_ready else "degraded",
            "service": settings.PROJECT_NAME,
            "databases": {
                "sql": "connected" if sql_ok else "failed",
                "mongodb": mongo_status
            }
        }
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Clean validation error formatting without leaking internals."""
    errors = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err["loc"] if loc != "body")
        errors.append(f"{field}: {err['msg']}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "; ".join(errors), "code": "VALIDATION_ERROR"}
    )

