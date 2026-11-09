FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# XGBoost's CPU runtime needs libgomp on Debian slim images.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt gunicorn

# Keep the repository-root layout because run_backend.py and the app's data/model
# paths are rooted at the project directory.
COPY . .

EXPOSE 8080

CMD ["sh", "-c", "exec gunicorn --bind 0.0.0.0:${PORT:-8080} --workers 1 --threads 8 --timeout 300 run_backend:app"]
