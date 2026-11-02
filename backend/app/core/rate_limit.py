import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import HTTPException, Request, status
from app.core.config import settings

class InMemoryRateLimiter:
    """Sliding-window in-memory rate limiter per IP/client."""
    def __init__(self):
        # Maps key -> list of timestamps
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def check(self, key: str, max_requests: int = 20, window_seconds: int = 60) -> bool:
        if not settings.RATE_LIMIT_ENABLED:
            return True

        now = time.time()
        window_start = now - window_seconds
        
        # Filter out timestamps older than window
        timestamps = [ts for ts in self.requests[key] if ts > window_start]
        self.requests[key] = timestamps
        
        if len(timestamps) >= max_requests:
            return False
            
        self.requests[key].append(now)
        return True

limiter = InMemoryRateLimiter()

def rate_limit_dependency(max_requests: int = 15, window_seconds: int = 60):
    async def dependency(request: Request):
        client_ip = request.client.host if request.client else "unknown"
        endpoint = request.url.path
        key = f"{client_ip}:{endpoint}"
        
        if not limiter.check(key, max_requests=max_requests, window_seconds=window_seconds):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Please wait a moment before trying again."
            )
    return dependency
