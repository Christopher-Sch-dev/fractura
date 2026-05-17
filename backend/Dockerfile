FROM python:3.12-slim

WORKDIR /app

# Force cache invalidation by copying requirements with a date stamp
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Copy app files
COPY . .

# Copy database file explicitly (bypasses .gitignore in build context)
COPY backend/data/data/fractura.db /app/data/fractura.db

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV LOCAL_DATA_PATH=/app/data

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
