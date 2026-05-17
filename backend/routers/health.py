from fastapi import APIRouter, HTTPException, Request
from backend.models import HealthResponse
from backend.db import get_db
from backend.loaders.chilecompra import TEST_MODE_THRESHOLD
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

        # Check if test mode is active
        total_contratos = db.execute("SELECT COUNT(*) FROM contrato WHERE fuente LIKE 'chilecompra_%'").fetchone()[0]
        is_test = TEST_MODE_THRESHOLD > 0 and total_contratos < TEST_MODE_THRESHOLD

        return HealthResponse(status="ok", db="connected")
    except Exception as e:
        return HealthResponse(status="error", db=str(e))