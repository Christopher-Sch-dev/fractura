from fastapi import APIRouter, HTTPException
from backend.models import HealthResponse
from backend.db import get_db
import os

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health():
    try:
        db = get_db()
        db_mode = os.getenv("DB_MODE", "duckdb")
        if db_mode == "postgres":
            result = db.execute("SELECT 1 AS result")
        else:
            result = db.execute("SELECT 1 AS result")
        result.fetchone()
        return HealthResponse(status="ok", db="connected")
    except Exception as e:
        return HealthResponse(status="error", db=str(e))