FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci

COPY apps/api apps/api

WORKDIR /app/apps/api

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "/app/apps/api/docker-entrypoint.sh"]
