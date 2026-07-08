# EC2 Deployment

This project includes an EC2-oriented deployment baseline for the API and PostgreSQL while keeping secrets out of the repository.

## What Is Included

- A Docker Compose stack for EC2: [docker-compose.ec2.yml](../deploy/ec2/docker-compose.ec2.yml)
- Example environment files without real secrets:
  - [api.env.example](../deploy/ec2/api.env.example)
  - [postgres.env.example](../deploy/ec2/postgres.env.example)
- A `systemd` unit for boot-time startup: [salary-management.service](../deploy/ec2/salary-management.service)
- An optional host Nginx reverse proxy config: [nginx.salary-management.conf](../deploy/ec2/nginx.salary-management.conf)

## Secrets Strategy

Do not commit production secrets into the repo.

Instead, place real environment files on the EC2 instance under:

```text
/etc/salary-management/api.env
/etc/salary-management/postgres.env
```

The committed example files are templates only.

Recommended file permissions:

```bash
sudo mkdir -p /etc/salary-management
sudo cp deploy/ec2/api.env.example /etc/salary-management/api.env
sudo cp deploy/ec2/postgres.env.example /etc/salary-management/postgres.env
sudo chmod 600 /etc/salary-management/api.env /etc/salary-management/postgres.env
```

## Suggested EC2 Layout

Clone the repo onto the instance at:

```text
/opt/salary-management
```

This matches the `WorkingDirectory` used by the sample `systemd` unit.

## Start With Docker Compose

From the repo root on the EC2 instance:

```bash
docker compose -f deploy/ec2/docker-compose.ec2.yml up -d --build
```

The API binds to `127.0.0.1:3000` so it can sit behind host Nginx.

## Optional Host Nginx

If you want Nginx on the EC2 host instead of in Docker:

1. Copy [nginx.salary-management.conf](../deploy/ec2/nginx.salary-management.conf) to `/etc/nginx/conf.d/salary-management.conf`
2. Adjust `server_name`
3. Reload Nginx

Example:

```bash
sudo cp deploy/ec2/nginx.salary-management.conf /etc/nginx/conf.d/salary-management.conf
sudo nginx -t
sudo systemctl reload nginx
```

## Run With systemd

To run the stack on boot:

```bash
sudo cp deploy/ec2/salary-management.service /etc/systemd/system/salary-management.service
sudo systemctl daemon-reload
sudo systemctl enable salary-management.service
sudo systemctl start salary-management.service
```

## Notes

- The API container currently initializes the schema with `prisma db push` from its Docker entrypoint.
- When checked-in Prisma migrations are available, this can be tightened to `prisma migrate deploy`.
- Redis is optional in the current API configuration. If you add it later, keep its connection string in `/etc/salary-management/api.env`, not in the repo.

## Future Path

The current EC2 setup is intentionally a simple MVP deployment shape, not the final infrastructure target.

A practical evolution path is:

- Single EC2 instance -> managed PostgreSQL on Amazon RDS
- Redis container -> Amazon ElastiCache
- API container on EC2 -> Amazon ECS/Fargate
- Frontend hosting -> Amazon S3 + CloudFront
- Structured logs and operational signals -> Amazon CloudWatch

This staged path keeps the early deployment simple while giving each moving part a clean managed-service destination:

- RDS removes database operations from the application host
- ElastiCache externalizes Redis so rate limiting and cache state can be shared safely
- ECS/Fargate removes most host management for the API container
- S3/CloudFront gives the frontend low-cost static hosting with CDN distribution
- CloudWatch centralizes logs, alarms, and health visibility

Because the codebase already separates the frontend, API, data stores, health checks, and structured logging concerns, this migration can happen incrementally instead of as a full replatforming event.
