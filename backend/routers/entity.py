from fastapi import APIRouter, HTTPException, Request
from limiter import limiter
from models import EntityResponse
from db import get_db

router = APIRouter()

@router.get("/entity/{entity_id}")
@limiter.limit("60/minute")
def get_entity(request: Request, entity_id: str):
    try:
        db = get_db()
        row = db.execute("""
            SELECT id, nombre, tipo, fuente FROM (
                SELECT rut AS id, nombre, 'Organismo' AS tipo, fuente FROM organismo WHERE rut = ?
                UNION ALL
                SELECT id, nombre, 'Empresa' AS tipo, fuente FROM empresa WHERE id = ?
                UNION ALL
                SELECT id, oc_id AS nombre, 'Contrato' AS tipo, fuente FROM contrato WHERE id = ?
            ) t LIMIT 1
        """, (entity_id, entity_id, entity_id)).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Entity not found")

        entity_id_db, nombre, tipo, fuente = row
        neighbors = []

        if tipo == "Organismo":
            rel = db.execute("""
                SELECT c.id, c.oc_id, c.monto, c.fecha, c.es_trato_directo, c.tipo, 'recibe', e.nombre
                FROM contrato c
                JOIN empresa e ON c.proveedor_id = e.id
                WHERE c.organismo_id = ?
                ORDER BY c.fecha DESC
                LIMIT 50
            """, (entity_id,)).fetchall()
            for r in rel:
                neighbors.append({"id": r[0], "nombre": r[1], "monto": r[2], "fecha": r[3], "es_td": r[4], "tipo": r[5], "relation": r[6], "empresa": r[7]})

        elif tipo == "Empresa":
            rel = db.execute("""
                SELECT c.id, c.oc_id, c.monto, c.fecha, c.es_trato_directo, c.tipo, 'contrata', o.nombre
                FROM contrato c
                JOIN organismo o ON c.organismo_id = o.rut
                WHERE c.proveedor_id = ?
                ORDER BY c.fecha DESC
                LIMIT 50
            """, (entity_id,)).fetchall()
            for r in rel:
                neighbors.append({"id": r[0], "nombre": r[1], "monto": r[2], "fecha": r[3], "es_td": r[4], "tipo": r[5], "relation": r[6], "organismo": o.nombre})

        elif tipo == "Contrato":
            org_rel = db.execute("""
                SELECT o.rut, o.nombre, 'contrata'
                FROM contrato c
                JOIN organismo o ON c.organismo_id = o.rut
                WHERE c.id = ?
            """, (entity_id,)).fetchall()
            for r in org_rel:
                neighbors.append({"id": r[0], "nombre": r[1], "relation": r[2]})

            emp_rel = db.execute("""
                SELECT e.id, e.nombre, 'recibe'
                FROM contrato c
                JOIN empresa e ON c.proveedor_id = e.id
                WHERE c.id = ?
            """, (entity_id,)).fetchall()
            for r in emp_rel:
                neighbors.append({"id": r[0], "nombre": r[1], "relation": r[2]})

        return EntityResponse(id=entity_id_db, nombre=nombre, tipo=tipo, source=fuente, neighbors=neighbors)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))