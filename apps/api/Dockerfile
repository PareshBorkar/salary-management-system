FROM node:20-bookworm-slim AS base

WORKDIR /app

RUN apt-get update && apt-get install -y openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci --workspace @salary-management/api --include-workspace-root=false \
  && npm cache clean --force

FROM deps AS build

COPY apps/api apps/api

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm run prisma:generate --workspace @salary-management/api
RUN npm run build --workspace @salary-management/api

FROM base AS runtime

ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json

RUN npm ci --workspace @salary-management/api --include-workspace-root=false --omit=dev \
  && npm cache clean --force

COPY --from=build /app/apps/api/dist apps/api/dist
COPY --from=build /app/apps/api/prisma apps/api/prisma
COPY --from=build /app/apps/api/node_modules/.prisma apps/api/node_modules/.prisma
COPY --from=build /app/apps/api/docker-entrypoint.sh apps/api/docker-entrypoint.sh

RUN chmod +x /app/apps/api/docker-entrypoint.sh

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["sh", "/app/apps/api/docker-entrypoint.sh"]
