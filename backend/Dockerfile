FROM python:3.12-slim

WORKDIR /app

# Install git to clone fresh from GitHub
RUN apt-get update && apt-get install -y --no-install-recommends git libstdc++6 \
    && rm -rf /var/lib/apt/lists/*

# Clone the repo at specific commit (no cache issue)
RUN git clone --depth 1 https://github.com/Christopher-Sch-dev/fractura.git app_src \
    && cp -r app_src/backend ./ \
    && cp app_src/backend/data/data/fractura.db ./data/ 2>/dev/null || true \
    && rm -rf app_src

RUN pip install --no-cache-dir -r requirements.txt

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV LOCAL_DATA_PATH=/app/data

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
