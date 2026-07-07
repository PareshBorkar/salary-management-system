# System Architecture

## High-Level Architecture

The Salary Management System follows a **modular monolithic architecture**, where all business capabilities are deployed as a single application while remaining logically separated by domain. This approach minimizes operational complexity, simplifies deployment, and allows rapid feature development during the MVP phase. The architecture is designed so that individual modules can later be extracted into microservices if business requirements demand independent scaling.

![System Architecture](./images/architecture.png)

## Architecture Overview

The system consists of the following components:

### Client Application

- React.js Single Page Application (SPA)
- Communicates with the backend over HTTPS
- Provides HR managers with a responsive interface for salary management

### Monolith Application

The backend is organized into domain-specific modules:

- Authentication
- Employee Management
- Salary Management
- Salary History
- Organization Management
- Analytics

Although deployed as a single application, each module owns its business logic and remains loosely coupled to improve maintainability.

### Operational Observability

The backend includes a lightweight observability baseline inside the monolith so application behavior can be traced without introducing a separate logging platform during the MVP phase.

Current capabilities include:

- Structured request completion logs for every API request
- A request ID on each request so frontend errors, API responses, and backend logs can be correlated
- Health check endpoints for basic uptime visibility and optional dependency reachability checks
- Salary history records that act as a business audit log for compensation changes

This keeps operational debugging and business-level auditing distinct:

- Request logs explain what the system did at runtime
- Salary history explains what compensation changed and who changed it

### Redis

Redis is used for **rate limiting** to protect the application against excessive or abusive requests.

Responsibilities include:

- Request counting
- Token bucket / rate limiting
- Temporary in-memory storage

Redis is intentionally isolated from persistent business data.

### PostgreSQL

PostgreSQL serves as the primary relational database.

It stores application data including:

- Organizations
- Users
- Employees
- Salaries
- Salary History

The relational model ensures transactional consistency and data integrity for compensation management.

### External Services

The application integrates with external services when required.

Current integrations include:

- Currency Exchange API
- AWS Secrets Manager

These services are kept outside the core business application to reduce coupling.

---

# Request Flow

1. The React application sends an HTTPS request.
2. The Monolith Application validates and authenticates the request.
3. The rate limiting middleware checks Redis before processing.
4. The appropriate domain module executes the business logic.
5. The application reads or writes data from PostgreSQL.
6. External services are invoked when required.
7. A structured completion log is emitted with the request ID, status code, and response time.
8. The response is returned to the client.

---

# Architectural Decisions

## Modular Monolith

The project intentionally adopts a modular monolith rather than microservices.

**Benefits**

- Faster MVP development
- Simpler deployment
- Easier debugging
- Lower infrastructure costs
- Strong transactional consistency
- Clear domain separation

This architecture provides a clean migration path toward microservices without introducing unnecessary operational complexity early in the project.

## Redis for Rate Limiting

Redis is used solely for rate limiting during the MVP.

Reasons include:

- Extremely fast in-memory operations
- Automatic key expiration
- Protection against brute-force attacks
- Reduced database load

Persistent application data continues to reside exclusively in PostgreSQL.

## PostgreSQL

A relational database was selected because salary management requires:

- ACID transactions
- Referential integrity
- Structured relationships
- Reliable auditing

These characteristics make PostgreSQL a strong fit for enterprise HR systems.

## Structured Logging & Request IDs

The API emits structured request completion logs rather than relying on ad hoc console output.

Each request log includes:

- `event`
- `requestId`
- `method`
- `path`
- `statusCode`
- `responseTimeMs`
- `userId`, `organizationId`, and `role` when the request is authenticated

This gives the team a stable correlation key for debugging production issues. A request ID can be traced across:

- Frontend error reports
- API responses and support tickets
- Backend application logs

Sensitive data such as passwords, tokens, cookies, request bodies, and email addresses is intentionally excluded from the request completion log context.

## Health Checks

The backend exposes health endpoints to support uptime monitoring and infrastructure diagnostics:

- `GET /v1/health`
- `GET /v1/health?checkDependencies=true`

The default health response returns core service metadata such as:

- `status`
- `service`
- `environment`
- `uptimeSeconds`

When dependency checks are requested, the API also evaluates configured PostgreSQL and Redis reachability:

- Returns `ok` when dependencies are reachable
- Returns `degraded` with HTTP `503` when a configured dependency fails
- Returns `skipped` for dependencies that are not configured in the current environment

This allows simple load balancer or uptime probes to stay lightweight while still supporting deeper operational checks when needed.

## Salary History As Business Audit Log

Salary history is not only a product feature. It is also the system's business audit trail for compensation changes.

Every salary update:

- Preserves the previous amount
- Stores the new amount
- Captures the effective date
- Records the change reason
- Records the user who performed the update

This provides traceability for compensation decisions, supports compliance and reporting needs, and keeps business auditing separate from low-level infrastructure logging.

---

# Future Evolution

The architecture is intentionally designed for future scalability.

Potential improvements include:

- Horizontal scaling of the monolith
- Redis caching for frequently accessed data
- Background job processing
- Object storage for reports and attachments
- Extraction of individual domains into microservices
- Centralized observability and monitoring

One natural next step is to forward structured logs and health-derived operational signals into Amazon CloudWatch. That path would allow the team to add:

- Centralized log search
- Request-level dashboards and alarms
- Health check and dependency alerts
- Longer-term retention for operational diagnostics

Because the application already emits structured logs and stable request IDs, that future integration can be added without redesigning the API modules themselves.

These enhancements can be introduced incrementally without requiring significant architectural changes.
