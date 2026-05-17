from fastapi import APIRouter, HTTPException, Query, Request
from limiter import limiter
from models import SeedResponse, DetectionResponse, AlertaItem
from loaders.chilecompra import load_chilecompra_slice, run_detection
from db import get_db

router = APIRouter()

@router.post("/seed/chilecompra")
@limiter.limit("30/minute")
def seed_chilecompra(request: Request, year: int = 2023, month: int = 1, limit: int = 0):
    try:
        result = load_chilecompra_slice(year, month, limit=limit)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return SeedResponse(
            organismos=result.get("organismos", 0),
            empresas=result.get("empresas", 0),
            contratos=result.get("contratos", 0),
            filas_procesadas=result.get("filas_procesadas", 0),
            fuente=result.get("fuente"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect/chilecompra")
@limiter.limit("30/minute")
def detect_chilecompra(request: Request, fuente: str = None):
    try:
        result = run_detection(fuente=fuente)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/chilecompra")
@limiter.limit("60/minute")
def alerts_chilecompra(
    request: Request,
    patron: str = Query(default=None, description="recurrente|fraccionamiento|multi-org"),
    limit: int = Query(default=50, le=500),
    fuente: str = Query(default=None),
):
    try:
        db = get_db()
        where_parts = ["patron IS NOT NULL"]
        args = []
        if patron:
            where_parts.append("patron = ?")
            args.append(patron)
        if fuente:
            where_parts.append("fuente = ?")
            args.append(fuente)
        where_clause = " AND ".join(where_parts)

        rows = db.execute(f"""
            SELECT id, tipo, mensaje, monto, fecha,
                   organismo_id, proveedor_id,
                   severity, patron, fuente, caso_id, created_at
            FROM alerta
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT ?
        """, [*args, limit]).fetchall()

        return {
            "alertas": [
                {
                    "id": r[0],
                    "tipo": r[1],
                    "mensaje": r[2],
                    "monto": r[3],
                    "fecha_deteccion": r[4],
                    "organismo_id": r[5],
                    "proveedor_id": r[6],
                    "severity": r[7],
                    "patron": r[8],
                    "fuente": r[9],
                    "caso_id": r[10],
                    "created_at": str(r[11]) if r[11] else None,
                }
                for r in rows
            ],
            "count": len(rows),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))