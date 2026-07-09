#!/bin/sh
set -eu

cd /app/apps/api

if [ "${NODE_ENV:-development}" = "production" ]; then
  echo "Running Prisma production migrations..."

  ATTEMPTS=0
  MAX_ATTEMPTS=10

  until npx prisma migrate deploy; do
    ATTEMPTS=$((ATTEMPTS + 1))

    if [ "$ATTEMPTS" -ge "$MAX_ATTEMPTS" ]; then
      echo "Prisma migrate failed after $MAX_ATTEMPTS attempts"
      exit 1
    fi

    echo "Database not ready yet. Retrying in 5 seconds..."
    sleep 5
  done
else
  echo "Running Prisma db push for development..."
  npx prisma db push --skip-generate
fi

exec npm run start