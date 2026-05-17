import os
import logging
from logging.handlers import RotatingFileHandler
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import time

# Rate limiting — imported from limiter to avoid circular import
from limiter import limiter

# Logging setup
logger = logging.getLogger("fractura")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = RotatingFileHandler("/tmp/fractura-backend.log", maxBytes=2_000_000, backupCount=3)
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)-8s %(name)s %(message)s"))
    logger.addHandler(handler)

def log_request(req: Request, call_next):
    """Log every request with method, path, duration."""
    t0 = time.time()
    res = call_next(req)
    dur = (time.time() - t0) * 1000
    logger.info(f"{req.method} {req.url.path} → {dur:.1f}ms")
    return res


from routers import health, seed, alerts, entity, chilecompra, graph
from db import close_db, get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("DB_MODE") == "postgres":
        from db import get_db as _get_db_async
        pool = await _get_db_async()
    else:
        db = get_db()
    yield
    close_db()

app = FastAPI(title="FRACTURA API", version="0.3.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.middleware("http")(log_request)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://fractura.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["Content-Type"],
    max_age=600,
)

app.include_router(health.router)
app.include_router(seed.router)
app.include_router(chilecompra.router)
app.include_router(entity.router)
app.include_router(alerts.router)
app.include_router(graph.router)