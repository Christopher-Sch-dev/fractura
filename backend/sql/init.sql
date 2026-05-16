-- FRACTURA PostgreSQL + Apache AGE init script
-- Corre automático en primer boot del container
-- Requiere: apache/age:image

LOAD 'age';
SET search_path = ag_catalog, "$user", public;

-- Tablas relacionales
CREATE TABLE IF NOT EXISTS organismo (
    id VARCHAR PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    rut VARCHAR,
    codigo VARCHAR,
    region VARCHAR,
    fuente VARCHAR
);

CREATE TABLE IF NOT EXISTS empresa (
    id VARCHAR PRIMARY KEY,
    nombre VARCHAR NOT NULL,
    rut VARCHAR,
    actividad VARCHAR,
    region VARCHAR,
    fuente VARCHAR
);

CREATE TABLE IF NOT EXISTS contrato (
    id VARCHAR PRIMARY KEY,
    oc_id VARCHAR,
    monto BIGINT,
    fecha DATE,
    es_trato_directo BOOLEAN DEFAULT FALSE,
    estado VARCHAR,
    organismo_id VARCHAR REFERENCES organismo(id),
    proveedor_id VARCHAR REFERENCES empresa(id),
    fuente VARCHAR,
    tipo VARCHAR
);

CREATE TABLE IF NOT EXISTS alerta (
    id VARCHAR PRIMARY KEY DEFAULT 'alert_' || gen_random_uuid(),
    tipo VARCHAR,
    mensaje VARCHAR,
    monto BIGINT,
    fecha DATE,
    organismo_id VARCHAR,
    proveedor_id VARCHAR,
    severity VARCHAR,
    patron VARCHAR,
    fuente VARCHAR,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_contrato_fecha ON contrato(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_contrato_organismo ON contrato(organismo_id);
CREATE INDEX IF NOT EXISTS idx_contrato_proveedor ON contrato(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_contrato_monto ON contrato(monto DESC);
CREATE INDEX IF NOT EXISTS idx_alerta_fecha ON alerta(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerta_severity ON alerta(severity);

-- Grafo AGE
SELECT create_graph('fractura');