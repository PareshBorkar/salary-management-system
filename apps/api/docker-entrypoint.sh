#!/bin/sh
set -eu

cd /app/apps/api

npx prisma generate
npx prisma db push --skip-generate

exec npm run start
