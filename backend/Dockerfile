FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt .

# Install runtime deps
RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Copy app structure
COPY . .

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Note: files are copied so main.py ends up at /app/main.py (not /app/backend/main.py)
# But backend/ is a directory, so when rootDir=backend, files are at /app level
# The CMD needs to point to where main.py actually is
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
