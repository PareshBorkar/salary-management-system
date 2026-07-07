# Salary Management System

A web-based Salary Management System that enables HR teams to centrally manage employee compensation, salary revisions, and historical records through a secure and scalable platform.

## Tech Stack

- React
- TypeScript
- Node.js
- Express.js
- PostgreSQL
- Redis
- Docker

## Architecture

The application follows a **Modular Monolith** architecture with PostgreSQL as the primary database and Redis for rate limiting.

![System Architecture](./docs/images/architecture.png)

## Documentation

- [Architecture](./docs/architecture.md)
- [Technical Trade-offs](./docs/tradeoffs.md)
- [EC2 Deployment](./docs/deployment-ec2.md)
- [User Stories](./docs/user-stories.md)

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- PostgreSQL
- Redis

### Install Dependencies

```bash
npm install
```

### Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Current variables:

- `APP_NAME`: API service name used in health responses and logs
- `NODE_ENV`: runtime mode such as `development` or `production`
- `HOST`: API bind host
- `PORT`: API bind port
- `LOG_LEVEL`: backend log verbosity
- `CORS_ORIGIN`: allowed frontend origin for the API
- `VITE_API_BASE_URL`: frontend API base URL
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string for optional dependency checks and future rate limiting
- `JWT_SECRET`: JWT signing secret for authentication

### Start Local Development

Run both workspaces:

```bash
npm run dev
```

This starts:

- the API at `http://localhost:3000`
- the web app at `http://localhost:5173`

## Seed Data

Seed the API database with the default ACME dataset:

```bash
npm run prisma:seed --workspace apps/api
```

There is also a test-oriented seed command:

```bash
npm run prisma:seed:test --workspace apps/api
```

## Testing

Run all workspace tests:

```bash
npm run test
```

Run focused workspace tests:

```bash
npm run test --workspace apps/api
npm run test --workspace apps/web
```

## Docker

The repo includes a local container setup for:

- the API
- PostgreSQL
- an optional Nginx reverse proxy

Start the API and Postgres:

```bash
docker compose up --build
```

The API will be available at [http://localhost:3000/v1/health](http://localhost:3000/v1/health).

Start the optional Nginx proxy as well:

```bash
docker compose --profile proxy up --build
```

With the proxy enabled, the API is also available at [http://localhost:8080/v1/health](http://localhost:8080/v1/health).

To seed local Docker data after the stack is up:

```bash
docker compose exec api npm run prisma:seed
```

Current note: the container bootstrap uses `prisma db push` because Prisma migrations have not been fully checked into the repo yet. Once migrations are added, the Docker entrypoint can move to `prisma migrate deploy`.

## EC2 Deployment

For EC2-oriented deployment with externalized secrets, Docker Compose, `systemd`, and optional host Nginx, see:

- [EC2 Deployment](./docs/deployment-ec2.md)

## Status

🚧 Currently under development as an MVP.
