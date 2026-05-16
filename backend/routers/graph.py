from fastapi import APIRouter, HTTPException, Query
from backend.db import get_db

router = APIRouter()

@router.get("/graph/chilecompra")
def graph_chilecompra(
    node_id: str = Query(default=None, description="RUT/id del nodo centro (opcional)"),
    limit: int = Query(default=200, ge=1, le=500),
    fuente: str = Query(default=None),
):
    try:
        db = get_db()

        if node_id:
            # Vecinos del nodo específico
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
                    node_ids.add(l[0])  # organismo
                    node_ids.add(l[1])  # proveedor
                    node_ids.add(l[2])  # contrato

                nodes = []
                for nid in node_ids:
                    row = db.execute("""
                        SELECT rut, nombre, 'Organismo' FROM organismo WHERE rut = ?
                        UNION ALL
                        SELECT id, nombre, 'Empresa' FROM empresa WHERE id = ?
                        UNION ALL
                        SELECT id, oc_id, 'Contrato' FROM contrato WHERE id = ?
                    """, (nid, nid, nid)).fetchone()
                    if row:
                        nodes.append({"id": row[0], "label": row[1], "tipo": row[2]})

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

                nodes = []
                for nid in node_ids:
                    row = db.execute("""
                        SELECT rut, nombre, 'Organismo' FROM organismo WHERE rut = ?
                        UNION ALL
                        SELECT id, nombre, 'Empresa' FROM empresa WHERE id = ?
                        UNION ALL
                        SELECT id, oc_id, 'Contrato' FROM contrato WHERE id = ?
                    """, (nid, nid, nid)).fetchone()
                    if row:
                        nodes.append({"id": row[0], "label": row[1], "tipo": row[2]})

                graph_links = [{"source": l[0], "target": l[1]} for l in links]

            else:
                raise HTTPException(status_code=404, detail="Nodo no encontrado")

        else:
            # Grafo completo — organismos + empresas + contratos del slice
            # Limitar a los primeros 'limit' contratos y sus nodos conectados
            where_fuente = f" AND c.fuente = '{fuente}' " if fuente else ""
            contracts = db.execute(f"""
                SELECT DISTINCT c.organismo_id, c.proveedor_id, c.id
                FROM contrato c
                WHERE 1=1 {where_fuente}
                LIMIT ?
            """, (limit,)).fetchall()

            node_ids = set()
            for l in contracts:
                node_ids.add(l[0])
                node_ids.add(l[1])
                node_ids.add(l[2])

            nodes = []
            for nid in node_ids:
                row = db.execute("""
                    SELECT rut, nombre, 'Organismo' FROM organismo WHERE rut = ?
                    UNION ALL
                    SELECT id, nombre, 'Empresa' FROM empresa WHERE id = ?
                    UNION ALL
                    SELECT id, oc_id, 'Contrato' FROM contrato WHERE id = ?
                """, (nid, nid, nid)).fetchone()
                if row:
                    nodes.append({"id": row[0], "label": row[1], "tipo": row[2]})

            graph_links = [{"source": l[0], "target": l[1]} for l in contracts]

        return {"nodes": nodes, "links": graph_links}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))