from fastapi import APIRouter, HTTPException, Request
from limiter import limiter
from models import SeedResponse
from loaders.corrupcion import load_corrupcion_chile, run_detection_corrupcion

router = APIRouter()

@router.post("/seed")
@limiter.limit("30/minute")
def seed(request: Request):
    try:
        casos, entidades = load_corrupcion_chile()
        alertas = run_detection_corrupcion()
        return SeedResponse(casos=casos, entidades=entidades, alertas=len(alertas))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))