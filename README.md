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

## Status

🚧 Currently under development as an MVP.
