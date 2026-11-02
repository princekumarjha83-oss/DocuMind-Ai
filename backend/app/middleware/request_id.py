import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger("documind.http")

class RequestIdMiddleware(BaseHTTPMiddleware):
    """Generates or propagates unique correlation request IDs for tracing and auditability."""

    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = req_id

        start_time = time.perf_counter()
        response: Response = await call_next(request)
        process_time = time.perf_counter() - start_time

        response.headers["X-Request-ID"] = req_id
        response.headers["X-Process-Time"] = f"{process_time:.4f}"

        # Structured audit log for API requests (excluding static files and health polls)
        if request.url.path.startswith("/api/"):
            logger.info(
                f"[{req_id}] {request.method} {request.url.path} -> "
                f"Status: {response.status_code} in {process_time * 1000:.1f}ms"
            )

        return response

