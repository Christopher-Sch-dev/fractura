# Stage 1: Install dependencies only
FROM python:3.12-slim AS builder

WORKDIR /app

# Install only what pip needs
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Production image
FROM python:3.12-slim

WORKDIR /app

# Install only the installed packages from builder
COPY --from=builder /install /usr/local

# Runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Copy app
COPY backend/ ./backend/
COPY data/ ./data/

ENV PYTHONPATH=/app
ENV LOCAL_DATA_PATH=/app/data
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]