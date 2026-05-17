import csv
import os
from pathlib import Path
from db import get_db

DATA_PATH = Path(os.getenv("CORRUPCION_DATA_PATH", str(Path(__file__).parent.parent.parent / "fractura_research" / "fractura-local-data" / "raw" / "corrupcion_chile" / "casos_corrupcion_chile.csv")))

def _n(s):
    if s is None:
        return None
    s = s.strip()
    return s if s else None

def _slug(text):
    if text is None:
        return None
    text = text.lower().strip()
    text = "".join(c if c.isalnum() or c == "_" else "_" for c in text)
    return text[:80]

def load_corrupcion_chile():
    db = get_db()
    rows = []
    fuente = "corrupcion_chile"

    with open(DATA_PATH, encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter=";")
        for i, row in enumerate(reader):
            caso_id = f"caso_{i+1:03d}"
            try:
                ano = int(row.get("Año", "").strip()) if _n(row.get("Año")) else None
            except:
                ano = None
            try:
                ano_inicio = int(row.get("Año inicio", "").strip()) if _n(row.get("Año inicio")) else None
            except:
                ano_inicio = None
            try:
                ano_fin = int(row.get("Año fin", "").strip()) if _n(row.get("Año fin")) else None
            except:
                ano_fin = None

            rows.append({
                "id": caso_id,
                "nombre": _n(row.get("Caso")),
                "monto": _n(row.get("Monto")),
                "ano": ano,
                "ano_inicio": ano_inicio,
                "ano_fin": ano_fin,
                "sector": _n(row.get("Sector")),
                "partido": _n(row.get("Partido")),
                "comuna": _n(row.get("Comuna")),
                "posicion": _n(row.get("Posición")),
                "actual": _n(row.get("Actual")),
                "delitos": _n(row.get("Delitos")),
                "estado": _n(row.get("Estado")),
                "sentence": _n(row.get("Sentencia")),
                "condemna": _n(row.get("Condena")),
                "conclusion": _n(row.get("Conclusión")),
                "fuente1": _n(row.get("Fuente1")),
                "fuente2": _n(row.get("Fuente2")),
                "fuente3": _n(row.get("Fuente3")),
                "fuente4": _n(row.get("Fuente4")),
                "fuente5": _n(row.get("Fuente5")),
                "fuente": fuente,
            })

    casos_count = len(rows)
    entidades_count = 0

    for r in rows:
        monto_raw = r.get('monto') or '0'
        monto_int = int(monto_raw.replace('.', '').replace(',', '').strip() or 0)
        db.execute("""
            INSERT INTO caso
                (id, nombre, monto, ano, ano_inicio, ano_fin, sector, partido, comuna,
                 posicion, actual, delitos, estado, sentence, condemna, conclusion,
                 fuente1, fuente2, fuente3, fuente4, fuente5, fuente)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            r["id"], r["nombre"], monto_int,
            r["ano"] if r["ano"] is not None else None,
            r["ano_inicio"] if r["ano_inicio"] is not None else None,
            r["ano_fin"] if r["ano_fin"] is not None else None,
            r["sector"], r["partido"], r["comuna"], r["posicion"], r["actual"],
            r["delitos"], r["estado"], r["sentence"], r["condemna"], r["conclusion"],
            r["fuente1"], r["fuente2"], r["fuente3"], r["fuente4"], r["fuente5"], r["fuente"]
        ))

    for r in rows:
        for field in ["Beneficiado", "Perjudicado", "Responsable"]:
            name = _n(r.get(field))
            if name:
                ent_id = f"{_slug(name)}_{r['id']}"
                db.execute("""
                    INSERT INTO entidad (id, nombre, tipo, source)
                    VALUES (?, ?, ?, ?)
                """, (ent_id, name, field, f"corrupcion_chile:{r['id']}"))
                entidades_count += 1

    return casos_count, entidades_count

def run_detection_corrupcion():
    db = get_db()
    alertas = []
    fuente = "corrupcion_chile"

    casos = db.execute("""
        SELECT id, nombre, conclusion, monto, estado, delitos
        FROM caso
        WHERE (conclusion IS NOT NULL AND conclusion <> '')
           OR (estado IS NOT NULL AND estado <> '')
           OR (delitos IS NOT NULL AND delitos <> '')
    """).fetchall()

    KEYWORDS_ALTA = ['impunidad', 'fraude', 'malversación', 'cohecho', 'soborno']
    KEYWORDS_MEDIA = ['desvío', 'abandono de deberes', 'irregularidades', 'investigación']

    for row in casos:
        caso_id, nombre, conclusion, monto, estado, delitos = row
        combined = ' '.join(filter(None, [str(conclusion), str(estado), str(delitos)])).lower()
        if any(k in combined for k in KEYWORDS_ALTA):
            severity = "high"
        elif any(k in combined for k in KEYWORDS_MEDIA):
            severity = "medium"
        else:
            continue
        alert_id = f"alert_{caso_id}_cc"
        mensaje = f"[{conclusion}] {nombre}"
        db.execute("""
            INSERT INTO alerta
                (id, tipo, mensaje, monto, severity, fuente, caso_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (alert_id, "conclusion_flag", mensaje, monto, severity, fuente, caso_id))
        alertas.append({
            "id": alert_id,
            "tipo": "conclusion_flag",
            "mensaje": mensaje,
            "caso_id": caso_id,
            "severity": severity,
        })

    return alertas