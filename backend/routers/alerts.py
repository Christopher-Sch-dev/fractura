from fastapi import APIRouter, HTTPException
from backend.models import AlertaResponse
from backend.db import get_db

router = APIRouter()

@router.get("/alerts", response_model=AlertaResponse)
def get_alerts():
    try:
        db = get_db()
        result = db.execute("""
            SELECT id, tipo, mensaje, monto, fecha, organismo_id, proveedor_id,
                   severity, patron, fuente, created_at, caso_id
            FROM alerta
            ORDER BY created_at DESC
            LIMIT 500
        """)
        rows = result.fetchall()
        alertas = []
        for row in rows:
            alertas.append({
                "id": row[0],
                "tipo": row[1],
                "mensaje": row[2],
                "monto": row[3],
                "fecha": row[4],
                "organismo_id": row[5],
                "proveedor_id": row[6],
                "severity": row[7],
                "patron": row[8],
                "fuente": row[9],
                "created_at": str(row[10]) if row[10] else None,
                "caso_id": row[11] if len(row) > 11 else None,
            })
        return AlertaResponse(alertas=alertas)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))