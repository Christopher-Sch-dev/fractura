# FRACTURA

**Motor cívico de rastreo anticorrupción. Chile. Datos públicos. Sin filtro.**

[![Track: hack@latam 2026](https://img.shields.io/badge/Track-Transparency%20%26%20Corruption-crimson)](#)
[![Stack: FastAPI + DuckDB + React](https://img.shields.io/badge/Stack-FastAPI%20%7C%20DuckDB%20%7C%20React-blue)](#)
[![Deploy: Railway + Vercel](https://img.shields.io/badge/Deploy-Railway%20%2B%20Vercel-darkgreen)](#)

---

## Qué es

FRACTURA analiza datos públicos chilenos para detectar patrones de corrupción en contrataciones públicas. Conecta entidades — organismos, empresas, contratos, casos — en un grafo de relaciones y aplica reglas de detección para generar alertas navegables.

**No es un dashboard decorativo.** Es una herramienta de investigación cívica con datos reales, trazabilidad de fuentes y patrones defendibles.

---

## Estado — hack@latam 2026

```
✅  Backend: FastAPI + DuckDB + slowapi rate limiting
✅  Frontend: React 19 + Vite + Tailwind CSS v4 + Three.js
✅  Patrones P1/P2/P3 activos con 209 alertas reales
✅  2-page routing: LandingView (dashboard) + DetailView (caso)
✅  GlobeGraph con nodos stroke-only (visualización correcta)
✅  TEST_MODE badge + threshold configurado
🔄  Deploy: Railway (backend) + Vercel (frontend) — en curso
```

---

## Inicio rápido

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
PYTHONPATH=. python -m uvicorn backend.main:app --reload --port 8000
```

Backend en `http://127.0.0.1:8000`. Swagger docs en `/docs`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend en `http://localhost:5173`.  
La variable `VITE_API_URL` se configura automáticamente en `.env.local` si no existe.

---

## Cargar datos

```bash
# Seed casos corrupcion_chile (131 casos)
POST /seed

# Cargar ChileCompra (limit=0 para full, o límite específico)
POST /seed/chilecompra?limit=0

# Detectar patrones activos
POST /detect/chilecompra
```

---

## API endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servicio y conexión a DB |
| `POST` | `/seed` | Cargar casos corrupcion_chile |
| `POST` | `/seed/chilecompra?limit=N` | Cargar órdenes de compra ChileCompra |
| `POST` | `/detect/chilecompra` | Ejecutar reglas de detección |
| `GET` | `/alerts` | Todas las alertas (paginadas) |
| `GET` | `/alerts/chilecompra` | Alertas solo de ChileCompra |
| `GET` | `/alerts/{id}` | Detalle de una alerta por ID |
| `GET` | `/graph/chilecompra` | Grafo de relaciones completo |
| `GET` | `/graph/chilecompra?node_id=RUT` | Vecinos de un nodo específico |
| `GET` | `/entity/{id}` | Entidad con relaciones directas |

---

## Datos cargados

| Fuente | Casos/Alertas | Notas |
|--------|--------------|-------|
| `corrupcion_chile` | 131 casos | Casos reales documentados en Chile |
| `ChileCompra` | 318K órdenes de compra 2023 | Alertas P2+P3 activas |
| **Total alertas** | **209** | Mezcladas por fecha DESC |

---

## Patrones detectados

| ID | Patrón | Descripción | Estado |
|----|--------|-------------|--------|
| P1 | Proveedor único recurrente | Un proveedor gana todos los contratos de un organismo | ✅ Activo |
| P2 | Fraccionamiento | Contratos consecutivos bajo el umbral de trato directo | ✅ Activo |
| P3 | Multi-organismo | Un mismo RUT recibe contratos de múltiples organismos | ✅ Activo |

---

## Stack técnico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Backend API | FastAPI | 0.115.0 |
| Persistencia OLAP | DuckDB | 1.5.2 |
| Rate limiting | slowapi | 0.1.9 |
| Frontend | React + Vite + TypeScript | 19 / 6 / 5.7 |
| Estilos | Tailwind CSS v4 | 4.x |
| 3D effects | Three.js + @react-three/fiber | 0.184 / 9.6 |
| Visualización | react-force-graph-2d | 1.25 |
| Íconos | lucide-react | latest |
| Grafo (prod) | PostgreSQL + Apache AGE | vía docker-compose |

---

## Arquitectura

```
Fuentes (CSV, ZIP)        DuckDB (OLAP, data/fractura.db)
      ↓                          ↓
  FastAPI REST          →    Endpoints + slowapi
                                 ↓
                            React 19
                      Three.js Background3D
                     react-force-graph-2d
                  LandingView  ·  DetailView
```

- **Backend:** FastAPI 0.115.0 + DuckDB 1.5.2 — lee ZIPs directos sin descomprimir
- **Frontend:** React 19 + Vite + Tailwind CSS v4 — routing de 2 páginas
- **3D:** Three.js particle background compartido por ambas vistas
- **Grafo:** nodos stroke-only (formas huecas), shadowBlur para glow
- **Contenedores:** `docker-compose.yml` para PostgreSQL + Apache AGE (modo prod)

---

## Variables de entorno

### Backend (`.env` en `backend/`)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DB_MODE` | `duckdb` | `duckdb` (local) o `postgres` (prod) |
| `DATABASE_URL` | — | Solo si `DB_MODE=postgres` |
| `TEST_MODE_THRESHOLD` | `0` | >0 activa modo test con umbrales reducidos |

### Frontend (`.env.local` en `frontend/`)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_URL` | `http://127.0.0.1:8000` | URL del backend |

---

## Seguridad

- Rate limiting: **60 req/min** en endpoints públicos (slowapi)
- Secrets solo en Railway Dashboard — nunca en el repo
- `.env` y archivos `.db` bloqueados en `.gitignore`
- CORS con orígenes cerrados: `https://fractura.vercel.app`, `http://localhost:5173`, `http://127.0.0.1:5173`
- Solo GET desde el frontend — cero POST/PUT desde la UI
- `border-radius: 0` global — estética cyberpunk

---

## Deploy

### Backend → Railway

```bash
cd backend
railway login
railway init
railway up
```

Dockerfile incluido en `backend/Dockerfile`.

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
```

Conectado al repo GitHub — cada push a `main` dispara build automático.

---

## Diseño UI

- **Fondo:** `#0D0D0D` (deep black)
- **Señales activas:** `#00E5FF` (cyan) — solo para Interactive elements, bordes activos, glow
- **Severidad alta:** `#FF2A2A` (red)
- **Montos:** blanco puro `#E8E8E8` — cyan PROHIBIDO en información
- **Tipografía:** Inter + JetBrains Mono
- **border-radius:** 0 en todos los elementos

### Vistas

1. **LandingView (dashboard):** grafo interactivo + tabla de alertas + stats
2. **DetailView (caso):** partículas red/danger + DangerAura + metadata completa

---

## Documentación interna

| Documento | Descripción |
|-----------|-------------|
| `AGENTS.md` | Notas de ejecución y comandos de start |
| `docs/prd/PRD-003-Baseline-Oficial-2026-05-15.md` | Spec oficial del MVP |
| `docs/data-sources.md` | Fuentes de datos y estructura |
| `fractura_research/PRDs-fractura/` | todos los PRDs del proyecto |

---

## Repo

```
GitHub: https://github.com/Christopher-Sch-dev/fractura
```

---

## Licencia

MIT License