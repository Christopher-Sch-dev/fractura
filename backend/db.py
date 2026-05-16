from pathlib import Path
import os

DB_MODE = os.getenv("DB_MODE", "duckdb")
DATA_DIR = Path("C:/Users/chris/fractura_research/fractura-local-data/raw/chilecompra")

if DB_MODE == "duckdb":
    import duckdb
    _conn = None
    def get_db():
        global _conn
        if _conn is None:
            db_path = Path(__file__).parent.parent / "data" / "fractura.db"
            db_path.parent.mkdir(parents=True, exist_ok=True)
            _conn = duckdb.connect(str(db_path))
            _init_schema_duckdb(_conn)
        return _conn
    def close_db():
        global _conn
        if _conn:
            _conn.close()
            _conn = None
    def _init_schema_duckdb(conn):
        conn.execute("CREATE SEQUENCE IF NOT EXISTS alerta_seq START 1")
        conn.execute("""
            CREATE TABLE IF NOT EXISTS organismo (
                rut VARCHAR PRIMARY KEY,
                nombre VARCHAR NOT NULL,
                codigo VARCHAR,
                region VARCHAR,
                fuente VARCHAR
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS empresa (
                id VARCHAR PRIMARY KEY,
                nombre VARCHAR NOT NULL,
                rut VARCHAR,
                actividad VARCHAR,
                region VARCHAR,
                fuente VARCHAR
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS contrato (
                id VARCHAR PRIMARY KEY,
                oc_id VARCHAR,
                monto VARCHAR,
                fecha VARCHAR,
                es_trato_directo BOOLEAN DEFAULT FALSE,
                estado VARCHAR,
                organismo_id VARCHAR REFERENCES organismo(rut),
                proveedor_id VARCHAR REFERENCES empresa(id),
                fuente VARCHAR,
                tipo VARCHAR
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS alerta (
                id VARCHAR PRIMARY KEY,
                tipo VARCHAR,
                mensaje VARCHAR,
                monto VARCHAR,
                fecha VARCHAR,
                organismo_id VARCHAR,
                proveedor_id VARCHAR,
                severity VARCHAR,
                patron VARCHAR,
                fuente VARCHAR,
                caso_id VARCHAR,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.execute("CREATE INDEX IF NOT EXISTS idx_contrato_fecha ON contrato(fecha)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_contrato_organismo ON contrato(organismo_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_contrato_proveedor ON contrato(proveedor_id)")
        conn.execute("CREATE INDEX IF NOT EXISTS idx_contrato_monto ON contrato(monto)")

        conn.execute("""
            CREATE TABLE IF NOT EXISTS caso (
                id VARCHAR PRIMARY KEY,
                nombre VARCHAR NOT NULL,
                monto VARCHAR,
                ano INTEGER,
                ano_inicio INTEGER,
                ano_fin INTEGER,
                sector VARCHAR,
                partido VARCHAR,
                comuna VARCHAR,
                posicion VARCHAR,
                actual VARCHAR,
                delitos VARCHAR,
                estado VARCHAR,
                sentence VARCHAR,
                condemna VARCHAR,
                conclusion VARCHAR,
                fuente1 VARCHAR,
                fuente2 VARCHAR,
                fuente3 VARCHAR,
                fuente4 VARCHAR,
                fuente5 VARCHAR,
                fuente VARCHAR
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS entidad (
                id VARCHAR PRIMARY KEY,
                nombre VARCHAR NOT NULL,
                tipo VARCHAR,
                source VARCHAR
            )
        """)

elif DB_MODE == "postgres":
    import asyncpg
    _pool = None
    async def get_db():
        global _pool
        if _pool is None:
            dsn = os.getenv("DATABASE_URL", "postgresql://fractura:fractura_dev@localhost:5455/fractura")
            _pool = await asyncpg.create_pool(dsn, min_size=1, max_size=10)
        return _pool
    def close_db():
        global _pool
        if _pool:
            _pool.close()
            _pool = None