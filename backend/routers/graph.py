from fastapi import APIRouter, HTTPException, Query, Request
from limiter import limiter
from db import get_db

router = APIRouter()

@router.get("/graph/chilecompra")
@limiter.limit("60/minute")
def graph_chilecompra(
    request: Request,
    node_id: str = Query(default=None, description="RUT/id del nodo centro (opcional)"),
    limit: int = Query(default=200, ge=1, le=500),
    fuente: str = Query(default=None),
):
    try:
        db = get_db()

        if node_id:
            org_match = db.execute("SELECT rut FROM organismo WHERE rut = ?", (node_id,)).fetchone()
            emp_match = db.execute("SELECT id FROM empresa WHERE id = ?", (node_id,)).fetchone()

            if org_match:
                org_rut = node_id
                links = db.execute("""
                    SELECT DISTINCT c.organismo_id, c.proveedor_id, c.id
                    FROM contrato c
                    WHERE c.organismo_id = ?
                    LIMIT ?
                """, (org_rut, limit)).fetchall()
                node_ids = set()
                for l in links:
                    node_ids.add(l[0])
                    node_ids.add(l[1])
                    node_ids.add(l[2])
                nodes = _fetch_nodes_batch(db, node_ids)
                graph_links = [{"source": l[0], "target": l[1]} for l in links]

            elif emp_match:
                emp_id = node_id
                links = db.execute("""
                    SELECT DISTINCT c.organismo_id, c.proveedor_id, c.id
                    FROM contrato c
                    WHERE c.proveedor_id = ?
                    LIMIT ?
                """, (emp_id, limit)).fetchall()
                node_ids = set()
                for l in links:
                    node_ids.add(l[0])
                    node_ids.add(l[1])
                    node_ids.add(l[2])
                nodes = _fetch_nodes_batch(db, node_ids)
                graph_links = [{"source": l[0], "target": l[1]} for l in links]

            else:
                raise HTTPException(status_code=404, detail="Nodo no encontrado")

        else:
            if fuente:
                contracts = db.execute("""
                    SELECT DISTINCT c.organismo_id, c.proveedor_id, c.id
                    FROM contrato c
                    WHERE c.fuente = ?
                    LIMIT ?
                """, (fuente, limit)).fetchall()
            else:
                contracts = db.execute("""
                    SELECT DISTINCT c.organismo_id, c.proveedor_id, c.id
                    FROM contrato c
                    LIMIT ?
                """, (limit,)).fetchall()

            node_ids = set()
            for l in contracts:
                node_ids.add(l[0])
                node_ids.add(l[1])
                node_ids.add(l[2])
            nodes = _fetch_nodes_batch(db, node_ids)
            graph_links = [{"source": l[0], "target": l[1]} for l in contracts]

        return {"nodes": nodes, "links": graph_links}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def _fetch_nodes_batch(db, node_ids: set) -> list[dict]:
    if not node_ids:
        return []

    placeholders = ", ".join(["?"] * len(node_ids))
    nid_list = list(node_ids)

    rows = db.execute(f"""
        SELECT rut as id, nombre, 'Organismo' as tipo
        FROM organismo
        WHERE rut IN ({placeholders})
        UNION ALL
        SELECT id, nombre, 'Empresa' as tipo
        FROM empresa
        WHERE id IN ({placeholders})
        UNION ALL
        SELECT id, oc_id, 'Contrato' as tipo
        FROM contrato
        WHERE id IN ({placeholders})
    """, nid_list + nid_list + nid_list).fetchall()

    seen: dict[str, dict] = {}
    for row in rows:
        if row[0] and row[1] and row[0] not in seen:
            seen[row[0]] = {"id": row[0], "label": row[1], "tipo": row[2]}
    return list(seen.values())