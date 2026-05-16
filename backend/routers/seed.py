from fastapi import APIRouter, HTTPException
from backend.models import SeedResponse
from backend.loaders.corrupcion import load_corrupcion_chile, run_detection_corrupcion

router = APIRouter()

@router.post("/seed")
def seed():
    try:
        casos, entidades = load_corrupcion_chile()
        alertas = run_detection_corrupcion()
        return SeedResponse(casos=casos, entidades=entidades, alertas=len(alertas))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))