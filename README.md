# FRACTURA

**Motor cívico de rastreo anticorrupción. Chile. Datos públicos. Sin filtro.**

[![Track: hack@latam 2026](https://img.shields.io/badge/Track-Transparency%20%26%20Corruption-crimson)](#)
[![Stack: FastAPI + DuckDB + React](https://img.shields.io/badge/Stack-FastAPI%20%7C%20DuckDB%20%7C%20React-blue)](#)
[![Deploy: Render + Vercel](https://img.shields.io/badge/Deploy-Render%20%2B%20Vercel-darkgreen)](#)

---

## Qué es

FRACTURA analiza datos públicos chilenos para detectar patrones de corrupción en contrataciones públicas. Conecta entidades — organismos, empresas, contratos, casos — en un grafo de relaciones y aplica reglas de detección para generar alertas navegables.

**No es un dashboard decorativo.** Es una herramienta de investigación cívica con datos reales, trazabilidad de fuentes y patrones defendibles.

---

## Estado — hack@latam 2026

```
✅  Backend: FastAPI + DuckDB + slowapi rate limiting (60 req/min)
✅  Frontend: React 19 + Vite + Tailwind CSS v4 + Three.js
✅  Patrones activos: multi-org (114) + fraccionamiento (21) = 135 alertas
✅  135 alertas + 74 alertas sin patrón clasificado = 209 total
✅  10,000 contratos, 1,572 organismos, 4,486 empresas, 128 casos
✅  2-view routing: LandingView + DetailView (state-based)
✅  GlobeGraph con nodos stroke-only (visualización correcta)
✅  Background3D con Three.js particle system
✅  Deploy: Render (backend) + Vercel (frontend) — OPERATIVO
🔄  Video demo + presentación pendiente
```

---

## URLs en vivo

| Servicio | URL |
|----------|-----|
| Frontend | https://fffractura.vercel.app |
| Backend API | https://fractura-api.onrender.com |
| Swagger docs | https://fractura-api.onrender.com/docs |
| Health check | https://fractura-api.onrender.com/health |

---

## Inicio rápido

### Backend (local)

```bash
cd backend
pip install -r requirements.txt
LOCAL_DATA_PATH=./data python -m uvicorn backend.main:app --reload --port 8000
```

La DB DuckDB vive en `backend/data/data/fractura.db` (git-lfs).

### Frontend (local)

```bash
cd frontend
npm install
npm run dev
```

Frontend en `http://localhost:5173`.  
`VITE_API_URL=http://127.0.0.1:8000` en `.env.local`.

---

## API endpoints

| Método | Path | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servicio y conexión a DB |
| `GET` | `/alerts` | Todas las alertas (limit 默认=500) |
| `GET` | `/alerts?patron=multi-org` | Filtrar por patrón |
| `GET` | `/alerts?patron=fraccionamiento` | Filtrar por patrón |
| `GET` | `/alerts/{id}` | Detalle de una alerta por ID |
| `GET` | `/graph/chilecompra` | Grafo de relaciones (nodes + links) |
| `GET` | `/graph/chilecompra?limit=N` | Limitar resultados |
| `GET` | `/graph/chilecompra?node_id=RUT` | Vecinos de un nodo |
| `POST` | `/seed` | Cargar casos corrupcion_chile |
| `POST` | `/seed/chilecompra?year=2023&month=1&limit=0` | Cargar ChileCompra |
| `POST` | `/detect/chilecompra` | Ejecutar reglas de detección |

---

## Datos cargados

| Fuente | Registros | Notas |
|--------|-----------|-------|
| `alerta` | **209** | 114 multi-org + 21 fraccionamiento + 74 sin patrón |
| `contrato` | **10,000** | Órdenes de compra ChileCompra |
| `organismo` | **1,572** | Entidades públicas |
| `empresa` | **4,486** | Proveedores únicos |
| `caso` | **128** | Casos documentados de corrupcion_chile |

---

## Patrones detectados

| ID | Patrón | Descripción | Count |
|----|--------|-------------|-------|
| P1 | Multi-organismo | Un mismo RUT recibe contratos de múltiples organismos | 114 |
| P2 | Fraccionamiento | Contratos consecutivos bajo el umbral de trato directo | 21 |
| — | Sin clasificar | Alertas sin campo patron definido | 74 |

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
| Íconos | Custom SVG inline | — |
| Grafo (prod) | DuckDB (sin Postgres en prod) | — |

---

## Arquitectura

```
Fuentes (CSV, ZIP)        DuckDB (OLAP, data/fractura.db)
      ↓                          ↓
  FastAPI REST          →    Endpoints + slowapi rate limiting
                                 ↓
                            React 19
                      Three.js Background3D
                     GlobeGraph (react-force-graph-2d)
                  LandingView  ·  DetailView
```

- **Backend:** FastAPI 0.115.0 + DuckDB 1.5.2 — lee ZIPs directos sin descomprimir
- **Frontend:** React 19 + Vite + Tailwind CSS v4 — routing de 2 vistas vía state
- **3D:** Three.js particle background compartido por ambas vistas
- **Grafo:** nodos stroke-only (formas huecas), glow por shadowBlur
- **Rate limiting:** 60 req/min en todos los endpoints públicos

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DB_MODE` | `duckdb` | `duckdb` (local/prod) o `postgres` (dev) |
| `LOCAL_DATA_PATH` | `/app/data` | Ruta donde vive `fractura.db` |
| `PYTHONUNBUFFERED` | `1` | Logs en tiempo real |
| `SLOWAPI_SILENT` | `1` | Silencia warnings de rate limit |

### Frontend (`frontend/.env.local`)

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_URL` | `http://127.0.0.1:8000` | URL del backend (en Vercel: producción) |

---

## Seguridad

- Rate limiting: **60 req/min** en endpoints públicos (slowapi)
- CORS: orígenes validados — `fffractura.vercel.app`, `fracturaclonado.vercel.app`, `localhost:5173`
- `.env` y archivos `.db` bloqueados en `.gitignore`
- Solo GET desde el frontend — cero POST/PUT desde la UI
- Secrets en variables de entorno de Vercel/Render — nunca en el repo

---

## Deploy

### Backend → Render

El servicio `fractura-api` corre en Render (free tier) via Docker.

```bash
# Ver estado
render services

# Ver logs
render logs --resources fractura-api --tail 20

# Trigger redeploy manualmente
render deploys create srv-d852louq1p3s73ebm0jg --confirm
```

Dockerfile en `backend/Dockerfile` — usa git clone para bypass de Docker cache.

### Frontend → Vercel

```bash
vercel --prod --yes
```

Conectado al repo GitHub — cada push a `main` dispara build automático.

---

## Diseño UI

- **Fondo:** `#0D0D0D` (deep black)
- **Señales activas:** `#00E5FF` (cyan) — bordes activos, glow, elementos interactivos
- **Severidad alta:** `#FF2A2A` (red)
- **Montos:** blanco puro `#E8E8E8` — cyan PROHIBIDO en datos numéricos
- **Tipografía:** Space Grotesk + JetBrains Mono
- **border-radius:** 0 en todos los elementos — estética cyberpunk硬

### Vistas

1. **LandingView:** stats + GlobeGraph + AlertTable con scroll
2. **DetailView:** partículas red/danger + DangerAura + metadata completa

---

## Repo

```
GitHub: https://github.com/Christopher-Sch-dev/fractura
Rama principal: main (deploy automático)
```

---

## Licencia

MIT License
