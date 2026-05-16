# FRACTURA

**Motor cívico de rastreo anticorrupción. Chile. Datos públicos. Sin filtro.**

[![Track: hacklatam 2026](https://img.shields.io/badge/Track-Transparency%20%26%20Corruption-crimson)](#)
[![Stack: FastAPI + DuckDB + React](https://img.shields.io/badge/Stack-FastAPI%20%7C%20DuckDB%20%7C%20React-blue)](#)

---

## Qué es

FRACTURA analiza datos públicos chilenos para detectar patrones de corrupción en contrataciones públicas. Conecta entidades — organismos, empresas, contratos, casos — en un grafo de relaciones y aplica reglas de detección para generar alertas navegables.

**No es un dashboard decorativo.** Es una herramienta de investigación cívica con datos reales, trazabilidad de fuentes y patrones defendibles.

---

## Estado

MVP funcional en `chore/pre-kickoff-base`:

| Criterio | Estado |
|----------|--------|
| Alertas reales ≥ 1 | ✅ 209 alertas (corrupcion_chile + ChileCompra) |
| Organismo identificado | ✅ |
| Empresa identificada | ✅ |
| Monto | ✅ (varios casos con monto) |
| Fecha | ✅ |
| Patrón activado y nombrado | ✅ P2 fraccionamiento, P3 multi-org |
| Fuente trazable | ✅ corrupcion_chile + ChileCompra API |
| Repo público | ✅ |

---

## Inicio rápido

### Backend

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn backend.main:app --reload --port 8000
```

El backend levanta en `http://127.0.0.1:8000`. Endpoints disponibles en `/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend en `http://localhost:5173`.

> **Nota:** El frontend espera `VITE_API_URL=http://127.0.0.1:8000` en `frontend/.env.local` (creado automáticamente si no existe).

### Cargar datos

```bash
# seed corrupcion_chile + detección de patrones
POST /seed

# cargar ChileCompra (full load o con limit)
POST /seed/chilecompra?limit=0

# detectar patrones activos
POST /detect/chilecompra
```

---

## API endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servicio y conexión a DB |
| `POST` | `/seed` | Cargar casos corrupcion_chile |
| `POST` | `/seed/chilecompra` | Cargar órdenes de compra ChileCompra |
| `POST` | `/detect/chilecompra` | Ejecutar reglas de detección |
| `GET` | `/alerts` | Todas las alertas (hasta 500) |
| `GET` | `/alerts/{id}` | Detalle de una alerta por ID |
| `GET` | `/graph/chilecompra` | Grafo de relaciones organismos→empresas→contratos |
| `GET` | `/graph/chilecompra?node_id=RUT` | Vecinos de un nodo específico |
| `GET` | `/entity/{id}` | Entidad con sus relaciones directas |

---

## Datos cargados

| Fuente | Registros | Notas |
|--------|-----------|-------|
| `corrupcion_chile` | 131 casos, ~74 alertas | Casos reales documentados |
| `ChileCompra` | 318K órdenes de compra 2023 | 135 alertas (P2+P3) |
| **Total alertas** | **209** | Mezcladas por fecha DESC |

### Patrones detectados

| Patrón | Nombre | Descripción |
|--------|--------|-------------|
| P1 | Proveedor único recurrente | Un proveedor gana todos los contratos de un organismo |
| P2 | Fraccionamiento | Contratos consecutivos bajo el umbral de trato directo |
| P3 | Multi-organismo | Un mismo RUT empresa recibe contratos de múltiples organismos |

---

## Arquitectura

```
Fuentes (CSV, ZIP)          DuckDB (OLAP)
        ↓                         ↓
    FastAPI REST          →    Endpoints
                                   ↓
                              React 19
                           react-force-graph
                           AlertTable + AlertDetail
```

- **Backend:** FastAPI 0.115.0 + DuckDB 1.5.2 — lee ZIPs directos sin descomprimir
- **Frontend:** React 19 + Vite + TypeScript — sin estado global, hooks locales
- **Visualización:** react-force-graph-2d para grafo de relaciones
- **Contenedores:** Docker + docker-compose (PostgreSQL + Apache AGE opcional)

---

## Stack técnico

| Capa | Tecnología |
|------|-------------|
| Backend API | FastAPI 0.115.0 |
| Persistencia OLAP | DuckDB 1.5.2 |
| Grafo (opcional producción) | PostgreSQL + Apache AGE |
| Frontend | React 19 + Vite + TypeScript |
| Visualización | react-force-graph |
| Deploy backend | Railway |
| Deploy frontend | Vercel |

---

## Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DB_MODE` | `duckdb` | `duckdb` o `postgres` |
| `DATABASE_URL` | — | Solo si `DB_MODE=postgres` |
| `VITE_API_URL` | `http://127.0.0.1:8000` | URL del backend para el frontend |

---

## Seguridad

- Secrets solo en Railway Dashboard — nunca en el repo
- `.env` y archivos `.db` bloqueados en `.gitignore`
- CORS con orígenes cerrados (no `*`)
- Solo GET desde el frontend — cero POST/PUT desde la UI
- Rate limiting: 60 req/min en endpoints públicos

---

## Documentación

- `docs/prd/PRD-003-Baseline-Oficial-2026-05-15.md` — spec oficial del MVP
- `docs/data-sources.md` — fuentes de datos y estructura

---

## Licencia

MIT License — ver `LICENSE`