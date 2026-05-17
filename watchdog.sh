#!/bin/bash
# Backend watchdog — auto-restart on crash, no detaches stdout
LOG="/tmp/fractura-watchdog.log"
DB_WAL="/home/Chris/fractura_clonado/data/fractura.db.wal"
PROJECT="/home/Chris/fractura_clonado"

echo "[$(date '+%H:%M:%S')] WATCHDOG STARTED" >> $LOG

while true; do
  rm -f "$DB_WAL" 2>/dev/null
  cd "$PROJECT"
  PYTHONPATH=. .venv/bin/python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 2>> $LOG
  echo "[$(date '+%H:%M:%S')] BACKEND CRASHED — restart in 3s" >> $LOG
  sleep 3
done