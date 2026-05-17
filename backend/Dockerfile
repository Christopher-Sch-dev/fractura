FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends git libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

RUN git clone --depth 1 https://github.com/Christopher-Sch-dev/fractura.git app_src \
    && cp -r app_src/backend ./ \
    && mkdir -p data \
    && cp backend/data/data/fractura.db data/fractura.db 2>/dev/null || true \
    && rm -rf app_src

WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV LOCAL_DATA_PATH=/app/data

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
