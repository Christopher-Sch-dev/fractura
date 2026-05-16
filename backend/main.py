import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import health, seed, alerts, entity, chilecompra, graph
from backend.db import close_db, get_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    if os.getenv("DB_MODE") == "postgres":
        from backend.db import get_db as _get_db_async
        pool = await _get_db_async()
    else:
        db = get_db()
    yield
    close_db()

app = FastAPI(title="FRACTURA API", version="0.3.0", lifespan=lifespan)

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