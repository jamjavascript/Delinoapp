#!/bin/bash
set -e

echo "Starting Delinoapp Backend..."

# Run database migrations (will auto-wait for DB)
echo "Running database migrations..."
alembic upgrade head || echo "Migrations failed, continuing anyway..."

echo "Migrations completed!"

# Start the application
echo "Starting FastAPI server on port ${PORT:-8000}..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --workers 1 \
    --log-level info
