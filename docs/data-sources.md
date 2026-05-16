# Data Sources

## 1. ChileCompra — Datos Abiertos

**URL principal:** https://datos-abiertos.chilecompra.cl
**URL descargas:** https://datos-abiertos.chilecompra.cl/descargas/procesos-ocds

**Descripción:** Portal de datos abiertos con órdenes de compra, licitaciones y procesos en formato OCDS. Acceso libre, sin autenticación.

**Estado actual:** Cargado en DuckDB — 318K órdenes de compra 2023 (enero). Genera alertas P2 (fraccionamiento) y P3 (multi-org).

**Ruta local:** `backend/loaders/chilecompra.py` — lee ZIPs directos sin descomprimir.

---

## 2. API Mercado Público

**URL:** https://www.chilecompra.cl/api/

**Descripción:** API de licitaciones del Estado chileno.

**Estado:** Sin acceso activo verificado — requiere registro manual.

---

## 3. bastianolea/corrupcion_chile

**URL:** https://github.com/bastianolea/corrupcion_chile

**Descripción:** 131 casos reales documentados de corrupción en Chile (1989–2025). CSV con estructura: caso, monto, sector, partido, comuna, delitos, estado, conclusión.

**Estado actual:** Cargado en DuckDB. 74 alertas generadas (severity high/medium según keywords detection). Virginia Reginato visible como alerta de alta.

**Ruta de datos:** `C:/Users/chris/fractura_research/fractura-local-data/raw/corrupcion_chile/casos_corrupcion_chile.csv`

---

## Regla de datos

Archivos > 1MB no se suben al repo. Excepciones: diccionarios de datos, archivos de trazabilidad pequeños.

```
.gitignore bloquea:
  *.csv  *.xlsx  *.zip  *.parquet  *.db  *.db-journal
```