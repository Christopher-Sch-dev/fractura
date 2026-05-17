import zipfile, tempfile, os
import duckdb
import pandas as pd
from pathlib import Path
from db import get_db

DATA_ROOT = Path(os.getenv("LOCAL_DATA_PATH", "/app/data"))

P1_THRESHOLD_COUNT = 3
P1_THRESHOLD_ORGS = 1
P1_THRESHOLD_COUNT_TEST = 2
P2_THRESHOLD_COUNT = 3
P2_THRESHOLD_COUNT_TEST = 2
P2_THRESHOLD_MONTO = 10_000_000
P2_THRESHOLD_MONTO_TEST = 500_000
P2_THRESHOLD_DAYS = 30
P3_THRESHOLD_ORGS = 3
P3_THRESHOLD_ORGS_TEST = 3
TEST_MODE_THRESHOLD = 0


def _zip_path(year, month):
    return DATA_ROOT / "ordenes_compra" / str(year) / f"oc_{year}_{month:02d}.zip"


def _extract_csv(zip_path):
    with zipfile.ZipFile(zip_path, "r") as zf:
        csv_name = next(n for n in zf.namelist() if n.lower().endswith(".csv"))
        tmp_dir = tempfile.mkdtemp()
        zf.extract(csv_name, tmp_dir)
        return os.path.join(tmp_dir, csv_name).replace("\\", "/")


def load_chilecompra_slice(year: int, month: int, limit: int = 0):
    db = get_db()
    zip_path = _zip_path(year, month)
    fuente = f"chilecompra_oc_{year}-{month:02d}"

    if not zip_path.exists():
        return {"error": f"Archivo no encontrado: {zip_path}"}

    csv_path = _extract_csv(zip_path)
    duck = duckdb.connect()

    try:
        RC = f"read_csv('{csv_path}', delim=';', header=true, normalize_names=true, ignore_errors=true)"
        LIMIT_SQL = f"LIMIT {limit}" if limit > 0 else ""

        con_df = duck.execute(f"""
            SELECT
                'cc_' || TRIM(id)                                                                        AS id,
                TRIM(id)                                                                                  AS oc_id,
                TRY_CAST(REPLACE(REPLACE(TRIM(COALESCE(montototaloc,'')), '.',''), ',', '.') AS DOUBLE)::BIGINT AS monto,
                TRY_CAST(fechacreacion AS DATE)                                                           AS fecha,
                LOWER(TRIM(COALESCE(estratodirecto, ''))) = 'si'                                          AS es_trato_directo,
                TRIM(COALESCE(estado, ''))                                                                 AS estado,
                TRIM(rutunidadcompra)                                                                       AS organismo_id,
                COALESCE(NULLIF(TRIM(rutsucursal), ''), TRIM(codigoproveedor))                            AS proveedor_id,
                '{fuente}'                                                                                  AS fuente,
                'OC'                                                                                        AS tipo
            FROM {RC}
            WHERE TRIM(COALESCE(id, ''))              != ''
              AND TRIM(COALESCE(rutunidadcompra, '')) != ''
              AND COALESCE(NULLIF(TRIM(rutsucursal), ''), TRIM(codigoproveedor)) IS NOT NULL
            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY TRIM(id)
                ORDER BY fechacreacion DESC NULLS LAST
            ) = 1
            {LIMIT_SQL}
        """).df()

        needed_org  = set(con_df['organismo_id'].dropna().str.strip())
        needed_prov = set(con_df['proveedor_id'].dropna().str.strip())

        rut_nombre = duck.execute(f"""
            SELECT
                TRIM(rutunidadcompra) AS rut,
                COALESCE(NULLIF(MAX(TRIM(COALESCE(organismopublico,''))), ''), 'Sin nombre') AS nombre
            FROM {RC}
            WHERE TRIM(COALESCE(rutunidadcompra, '')) != ''
            GROUP BY TRIM(rutunidadcompra)
        """).df()

        rut_codigo = duck.execute(f"""
            SELECT
                TRIM(rutunidadcompra) AS rut,
                MAX(NULLIF(TRIM(COALESCE(codigoorganismopublico,'')), '')) AS codigo
            FROM {RC}
            WHERE TRIM(COALESCE(rutunidadcompra, '')) != ''
            GROUP BY TRIM(rutunidadcompra)
        """).df()

        org_df = rut_nombre.merge(rut_codigo, on='rut', how='left')
        org_df['rut']    = org_df['rut'].str.strip()
        org_df['codigo'] = org_df['codigo'].fillna('')
        org_df['region'] = 'NA'
        org_df['fuente'] = fuente

        org_known = set(org_df['rut'])
        orphan_org = needed_org - org_known
        if orphan_org:
            org_df = pd.concat([
                org_df,
                pd.DataFrame({
                    'rut': list(orphan_org), 'nombre': 'Sin nombre',
                    'codigo': '', 'region': 'NA', 'fuente': fuente
                })
            ], ignore_index=True).drop_duplicates(subset='rut')

        emp_df = duck.execute(f"""
            SELECT
                COALESCE(NULLIF(TRIM(rutsucursal), ''), TRIM(codigoproveedor))                                   AS id,
                COALESCE(NULLIF(TRIM(COALESCE(nombreproveedor,'')), ''), 'Sin nombre')                          AS nombre,
                NULLIF(TRIM(COALESCE(rutsucursal,'')), '')                                                        AS rut,
                NULLIF(TRIM(COALESCE(actividadproveedor,'')), '')                                                 AS actividad,
                NULLIF(TRIM(COALESCE(regionproveedor,'')), '')                                                     AS region
            FROM {RC}
            WHERE COALESCE(NULLIF(TRIM(rutsucursal), ''), TRIM(codigoproveedor)) IS NOT NULL
            QUALIFY ROW_NUMBER() OVER (
                PARTITION BY COALESCE(NULLIF(TRIM(rutsucursal), ''), TRIM(codigoproveedor))
                ORDER BY nombreproveedor NULLS LAST
            ) = 1
        """).df()

        emp_rut_nombre = duck.execute(f"""
            SELECT
                COALESCE(NULLIF(TRIM(rutsucursal), ''), TRIM(codigoproveedor))                                   AS id,
                COALESCE(NULLIF(MAX(TRIM(COALESCE(nombreproveedor,''))), ''), 'Sin nombre')                      AS nombre,
                NULLIF(TRIM(COALESCE(rutsucursal,'')), '')                                                         AS rut,
                MAX(NULLIF(TRIM(COALESCE(actividadproveedor,'')), ''))                                            AS actividad,
                MAX(NULLIF(TRIM(COALESCE(regionproveedor,'')), ''))                                               AS region
            FROM {RC}
            WHERE COALESCE(NULLIF(TRIM(rutsucursal), ''), TRIM(codigoproveedor)) IS NOT NULL
            GROUP BY COALESCE(NULLIF(TRIM(rutsucursal), ''), TRIM(codigoproveedor)),
                     NULLIF(TRIM(COALESCE(rutsucursal,'')), '')
        """).df()

        emp_df = emp_rut_nombre.drop_duplicates(subset='id')
        emp_df['id']     = emp_df['id'].str.strip()
        emp_df['fuente'] = fuente

        emp_known = set(emp_df['id'])
        orphan_prov = needed_prov - emp_known
        if orphan_prov:
            emp_df = pd.concat([
                emp_df,
                pd.DataFrame({
                    'id': list(orphan_prov), 'nombre': 'Sin nombre',
                    'rut': None, 'actividad': None, 'region': None, 'fuente': fuente
                })
            ], ignore_index=True).drop_duplicates(subset='id')

        final_org  = set(org_df['rut'])
        final_emp  = set(emp_df['id'])
        miss_org   = set(con_df['organismo_id'].dropna()) - final_org
        miss_prov  = set(con_df['proveedor_id'].dropna()) - final_emp

        warn_descartados = 0
        if miss_org or miss_prov:
            n_before = len(con_df)
            con_df = con_df[
                con_df['organismo_id'].isin(final_org) &
                con_df['proveedor_id'].isin(final_emp)
            ]
            warn_descartados = n_before - len(con_df)
            print(f"[WARN] loader: {warn_descartados} contratos descartados por FK imposible")
            if miss_org:
                print(f"  org  huérfanos: {list(miss_org)[:3]}")
            if miss_prov:
                print(f"  prov huérfanos: {list(miss_prov)[:3]}")

    finally:
        duck.close()
        try:
            os.unlink(csv_path)
        except Exception:
            pass

    db.execute("DELETE FROM contrato  WHERE fuente = ?", (fuente,))
    db.execute("DELETE FROM alerta   WHERE fuente = ?", (fuente,))
    db.execute("DELETE FROM empresa   WHERE fuente = ?", (fuente,))
    db.execute("DELETE FROM organismo WHERE fuente = ?", (fuente,))

    db.executemany(
        "INSERT OR IGNORE INTO organismo(rut, nombre, codigo, region, fuente) VALUES (?,?,?,?,?)",
        org_df[['rut','nombre','codigo','region','fuente']].values.tolist()
    )
    db.executemany(
        "INSERT OR IGNORE INTO empresa(id, nombre, rut, actividad, region, fuente) VALUES (?,?,?,?,?,?)",
        emp_df[['id','nombre','rut','actividad','region','fuente']].values.tolist()
    )
    db.executemany(
        "INSERT OR IGNORE INTO contrato(id, oc_id, monto, fecha, es_trato_directo, estado, organismo_id, proveedor_id, fuente, tipo) VALUES (?,?,?,?,?,?,?,?,?,?)",
        con_df[['id','oc_id','monto','fecha','es_trato_directo','estado','organismo_id','proveedor_id','fuente','tipo']].values.tolist()
    )

    return {
        "organismos": db.execute("SELECT COUNT(*) FROM organismo WHERE fuente=?", (fuente,)).fetchone()[0],
        "empresas":   db.execute("SELECT COUNT(*) FROM empresa   WHERE fuente=?", (fuente,)).fetchone()[0],
        "contratos":  db.execute("SELECT COUNT(*) FROM contrato  WHERE fuente=?", (fuente,)).fetchone()[0],
        "warn_contratos_descartados": warn_descartados,
        "fuente": fuente
    }


def run_detection(fuente: str = None):
    db = get_db()

    if fuente is None:
        rows = db.execute("SELECT DISTINCT fuente FROM contrato WHERE fuente LIKE 'chilecompra_%'").fetchall()
        fuentes = [r[0] for r in rows]
    else:
        fuentes = [fuente]

    results_by_fuente = {}

    for f in fuentes:
        total_contratos = db.execute("SELECT COUNT(*) FROM contrato WHERE fuente=?", (f,)).fetchone()[0]
        is_test = total_contratos < TEST_MODE_THRESHOLD

        c1 = P1_THRESHOLD_COUNT_TEST if is_test else P1_THRESHOLD_COUNT
        c2 = P2_THRESHOLD_COUNT_TEST if is_test else P2_THRESHOLD_COUNT
        m2 = P2_THRESHOLD_MONTO_TEST if is_test else P2_THRESHOLD_MONTO
        o3 = P3_THRESHOLD_ORGS_TEST if is_test else P3_THRESHOLD_ORGS

        if is_test:
            print(f"[WARN] run_detection: test mode (n={total_contratos} < {TEST_MODE_THRESHOLD}) — umbrales reducidos: P1>{c1}, P2>={c2}+{m2:,}, P3>={o3}")

        alerts_inserted = 0

        db.execute("DELETE FROM alerta WHERE fuente = ? AND patron IS NOT NULL", (f,))

        p1_df = db.execute(f"""
            SELECT
                e.rut                              AS empresa_rut,
                e.nombre                           AS empresa_nombre,
                COUNT(c.id)                        AS total_contratos,
                COUNT(DISTINCT c.organismo_id)      AS total_organismos,
                SUM(TRY_CAST(c.monto AS BIGINT))   AS monto_acumulado
            FROM contrato c
            JOIN empresa e ON c.proveedor_id = e.id
            WHERE c.fuente = ?
              AND e.nombre != 'Sin nombre'
            GROUP BY e.rut, e.nombre
            HAVING COUNT(c.id) > {c1}
               AND COUNT(DISTINCT c.organismo_id) = 1
            ORDER BY total_contratos DESC
        """, (f,)).df()

        for _, row in p1_df.iterrows():
            monto_val = row['monto_acumulado'] if row['monto_acumulado'] is not None else 0
            db.execute("""
                INSERT INTO alerta
                    (id, tipo, mensaje, monto, organismo_id, proveedor_id,
                     severity, patron, fuente)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"p1_{row['empresa_rut']}_{f}",
                "recurrente",
                f"Proveedor '{row['empresa_nombre']}' con {row['total_contratos']} contratos "
                f"en {row['total_organismos']} organismo (monto total: {monto_val:,})",
                monto_val,
                None,
                None,
                "medium",
                "recurrente",
                f,
            ))
            alerts_inserted += 1

        p2_df = db.execute(f"""
            SELECT
                c.organismo_id,
                c.proveedor_id,
                e.nombre                           AS empresa_nombre,
                e.rut                              AS empresa_rut,
                COUNT(c.id)                        AS contratos_en_ventana,
                SUM(TRY_CAST(c.monto AS BIGINT))   AS monto_acumulado,
                MIN(TRY_CAST(c.fecha AS DATE))      AS desde,
                MAX(TRY_CAST(c.fecha AS DATE))     AS hasta
            FROM contrato c
            JOIN empresa e ON c.proveedor_id = e.id
            WHERE c.fuente = ?
              AND c.fecha IS NOT NULL
              AND e.nombre != 'Sin nombre'
            GROUP BY c.organismo_id, c.proveedor_id, e.nombre, e.rut
            HAVING COUNT(c.id) >= {c2}
               AND SUM(TRY_CAST(c.monto AS BIGINT)) > {m2}
               AND (MAX(TRY_CAST(c.fecha AS DATE)) - MIN(TRY_CAST(c.fecha AS DATE))) <= {P2_THRESHOLD_DAYS}
            ORDER BY monto_acumulado DESC
        """, (f,)).df()

        for _, row in p2_df.iterrows():
            monto_val = row['monto_acumulado'] if row['monto_acumulado'] is not None else 0
            desde_str = str(row['desde']) if row['desde'] else 'N/A'
            hasta_str = str(row['hasta']) if row['hasta'] else 'N/A'
            db.execute("""
                INSERT INTO alerta
                    (id, tipo, mensaje, monto, organismo_id, proveedor_id,
                     severity, patron, fuente)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"p2_{row['organismo_id']}_{row['proveedor_id']}_{f}",
                "fraccionamiento",
                f"Fraccionamiento: '{row['empresa_nombre']}' con {row['contratos_en_ventana']} contratos "
                f"en {desde_str} a {hasta_str} (monto total: {monto_val:,})",
                monto_val,
                row['organismo_id'],
                row['proveedor_id'],
                "high",
                "fraccionamiento",
                f,
            ))
            alerts_inserted += 1

        p3_df = db.execute(f"""
            SELECT
                e.rut                              AS empresa_rut,
                e.nombre                           AS empresa_nombre,
                COUNT(DISTINCT c.organismo_id)     AS total_organismos,
                SUM(TRY_CAST(c.monto AS BIGINT))   AS monto_total
            FROM contrato c
            JOIN empresa e ON c.proveedor_id = e.id
            WHERE c.fuente = ?
              AND e.nombre != 'Sin nombre'
            GROUP BY e.rut, e.nombre
            HAVING COUNT(DISTINCT c.organismo_id) >= {o3}
            ORDER BY total_organismos DESC
        """, (f,)).df()

        for _, row in p3_df.iterrows():
            monto_val = row['monto_total'] if row['monto_total'] is not None else 0
            db.execute("""
                INSERT INTO alerta
                    (id, tipo, mensaje, monto, organismo_id, proveedor_id,
                     severity, patron, fuente)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                f"p3_{row['empresa_rut']}_{f}",
                "multi-org",
                f"Empresa '{row['empresa_nombre']}' presente en {row['total_organismos']} organismos (monto total: {monto_val:,})",
                monto_val,
                None,
                None,
                "medium",
                "multi-org",
                f,
            ))
            alerts_inserted += 1

        results_by_fuente[f] = {
            "test_mode": is_test,
            "p1_recurrente": len(p1_df),
            "p2_fraccionamiento": len(p2_df),
            "p3_multi_org": len(p3_df),
            "alerts_inserted": alerts_inserted,
        }

    return results_by_fuente