FROM python:3.12-slim

WORKDIR /app

# Use git clone approach instead of COPY
# This ensures fresh context from Git
ARG GIT_COMMIT=unknown

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Copy app - use git archive to avoid .gitignore filtering
COPY backend/ ./backend/

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV LOCAL_DATA_PATH=/app/data

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
