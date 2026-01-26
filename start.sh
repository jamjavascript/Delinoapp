#!/bin/bash
set -e

echo "🚀 Starting Delinoapp Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
python << END
import time
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

max_retries = 30
retry_count = 0

while retry_count < max_retries:
    try:
        engine = create_engine(settings.DATABASE_URL)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("✅ Database connection successful!")
        engine.dispose()
        sys.exit(0)
    except Exception as e:
        retry_count += 1
        print(f"⏳ Database not ready (attempt {retry_count}/{max_retries}): {e}")
        time.sleep(2)

print("❌ Database connection failed after maximum retries")
sys.exit(1)
END

# Run database migrations
echo "📦 Running database migrations..."
alembic upgrade head

echo "✅ Migrations completed successfully!"

# Start the application
# Using single worker for memory efficiency on Railway free tier
# Railway provides the PORT environment variable
echo "🌐 Starting FastAPI server on port ${PORT:-8000}..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port ${PORT:-8000} \
    --workers 1 \
    --timeout-keep-alive 30 \
    --log-level info
