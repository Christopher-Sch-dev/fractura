# FRACTURA — Agent Notes

## Start commands

```bash
# Backend (run from repo root, not from backend/)
cd /home/Chris/fractura_clonado
PYTHONPATH=. .venv/bin/python -m uvicorn backend.main:app --reload --port 8000

# Frontend
cd frontend && npm run dev
```

Backend runs on `http://127.0.0.1:8000`, frontend on `http://localhost:5173`.

## Key architecture facts

- **Backend imports use absolute style**: `from backend.routers import health` — not relative. Requires `PYTHONPATH=.` or running from repo root.
- **Dual DB modes**: `DB_MODE=duckdb` (default) or `DB_MODE=postgres`. Docker-compose sets up PostgreSQL + Apache AGE.
- **DuckDB data location**: `data/fractura.db`
- **Vite proxies these paths to backend**: `/alerts`, `/graph`, `/entity`, `/seed`, `/detect`, `/health`
- **Frontend env**: `frontend/.env.local` has `VITE_API_URL=` (defaults to `http://127.0.0.1:8000` if empty)

## Data loading (backend must be running)

```bash
# Load corrupcion_chile cases + run pattern detection
POST /seed

# Load ChileCompra orders (limit=0 for full load)
POST /seed/chilecompra?limit=0

# Run pattern detection on ChileCompra data
POST /detect/chilecompra
```

## No test suite

No tests exist yet. Do not attempt to run a test command.

## Stack

| Layer | Tech |
|-------|------|
| Backend | FastAPI 0.115.0 + DuckDB 1.5.2 |
| Frontend | React 19 + Vite + TypeScript + react-force-graph |
| Optional DB | PostgreSQL + Apache AGE (via docker-compose) |

## Key files

- `backend/db.py` — dual DB mode (duckdb/postgres) schema init
- `backend/main.py` — CORS origins, router registration
- `vite.config.ts` — proxy config to backend
- `docker-compose.yml` — PostgreSQL + AGE setup
