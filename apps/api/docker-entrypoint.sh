#!/bin/sh
set -eu

cd /app/apps/api

npx prisma generate

if [ "${NODE_ENV:-development}" = "production" ]; then
  echo "Running Prisma production migrations..."
  npx prisma migrate deploy
else
  echo "Running Prisma db push for development..."
  npx prisma db push --skip-generate
fi

exec npm run start