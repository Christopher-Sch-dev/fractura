#!/bin/bash
# Backend watchdog - auto-restart on crash
LOG="/tmp/backend-watchdog.log"
echo "[$(date)] Backend watchdog started" >> $LOG

while true; do
  cd /home/Chris/fractura_clonado
  rm -f data/fractura.db.wal 2>/dev/null
  PYTHONPATH=. .venv/bin/python3 -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 >> $LOG 2>&1
  echo "[$(date)] Backend crashed, restarting in 3s..." >> $LOG
  sleep 3
done