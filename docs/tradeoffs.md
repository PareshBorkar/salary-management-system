# Architecture & Design Trade-offs

This document outlines the key architectural decisions made for the MVP, the trade-offs considered, and the reasoning behind each choice.

---

# 1. Modular Monolith vs Microservices

## Decision

The application is implemented as a **modular monolith** with clear domain boundaries.

## Why

- Simpler development and deployment.
- Easier debugging and testing.
- Reduced operational complexity.
- Well suited for an MVP and a single development team.

## Trade-off

The application cannot independently scale individual modules.

## Future Evolution

Each domain module (Authentication, Employees, Salaries, Analytics, etc.) has clear ownership and can be extracted into independent microservices if scaling, deployment, or team ownership requires it.

---

# 2. PostgreSQL vs SQLite

## Decision

Use **PostgreSQL**.

## Why

- Better represents a production SaaS environment.
- Supports indexing and complex queries efficiently.
- Handles larger datasets more realistically.
- Excellent Prisma support.

## Trade-off

Slightly more setup compared to SQLite.

---

# 3. SQL vs NoSQL

## Decision

Use **PostgreSQL (SQL)** as the primary datastore.

## Why

The application manages highly structured and relational data including organizations, users, employees, salaries, and salary history. SQL provides strong transactional guarantees, relational integrity, and powerful querying capabilities, making it well suited for compensation management and reporting.

Compensation analytics such as payroll by country, average salary by department, salary bands, salary distribution, and salary history are naturally supported through relational queries and aggregations.

## Trade-off

A relational schema is less flexible than a NoSQL document model and requires more upfront data modeling. However, the improved consistency, data integrity, and query capabilities outweigh the flexibility benefits for this domain.

## Future Evolution

NoSQL databases may be introduced later for specific workloads such as activity logs, audit archives, AI/RAG knowledge stores, event streaming, or other unstructured data, while PostgreSQL continues to serve as the system of record for transactional salary data.

---

# 4. Prisma vs Traditional ORM

## Decision

Use **Prisma ORM**.

## Why

- Excellent TypeScript support.
- Type-safe database queries.
- Simple schema migrations.
- Strong developer experience.
- Improved maintainability.

## Trade-off

Requires learning Prisma conventions if unfamiliar.

---

# 5. JWT Authentication vs Managed Identity Provider

## Decision

Use **JWT authentication**.

## Why

- Keeps the MVP self-contained.
- Minimal infrastructure setup.
- Demonstrates authentication and authorization concepts.
- Easy to deploy and manage for a single organization.

## Trade-off

Enterprise authentication features such as password reset, MFA, SSO, and user lifecycle management are intentionally excluded.

## Future Evolution

Authentication can later be migrated to Amazon Cognito or another enterprise identity provider.

---

# 6. USD as Base Currency

## Decision

Employee salaries are stored in **USD** as the system's base currency.

## Why

- Enables consistent organization-wide reporting.
- Simplifies compensation analytics.
- Avoids storing duplicated salary values.
- Supports a single reporting currency regardless of employee location.

Local currency values are calculated dynamically using exchange rates obtained from a configurable currency exchange provider.

## Trade-off

Displayed salary values depend on exchange rates and may vary over time.

---

# 7. Dashboard Analytics vs AI Chat

## Decision

The MVP focuses on **structured dashboards and predefined analytics**.

## Why

- Deterministic responses.
- Easier validation.
- Better user experience for HR reporting.
- Faster implementation within MVP scope.

## Trade-off

Natural-language querying is intentionally excluded.

## Future Evolution

An AI assistant can later consume the same analytics services or reporting APIs to answer HR questions using natural language.

---

# 8. Server-side Pagination

## Decision

Filtering, sorting, searching, and pagination are implemented on the server.

## Why

- Efficiently supports datasets containing 10,000+ employees.
- Reduces frontend memory usage.
- Improves application responsiveness.
- Minimizes unnecessary network traffic.

## Trade-off

Requires more backend query implementation compared to client-side processing.

---

# 9. Single EC2 Deployment

## Decision

Deploy the MVP on a **single AWS EC2 instance** using Docker.

## Why

- Cost-effective.
- Simple infrastructure.
- Easy deployment and maintenance.
- Appropriate for an MVP and assessment environment.

## Trade-off

- Single point of failure.
- Limited horizontal scalability.
- Infrastructure and database share the same host.

## Future Evolution

The architecture supports gradual migration to:

- Frontend → Amazon S3 + CloudFront
- PostgreSQL → Amazon RDS
- Redis → Amazon ElastiCache
- Backend → Amazon ECS/Fargate or Kubernetes
- Monitoring → Amazon CloudWatch

---

# 10. Redis-backed Rate Limiting

## Decision

Implement API rate limiting using Redis.

## Why

- Shared rate limits across application instances.
- Production-ready approach.
- More scalable than in-memory rate limiting.
- Protects authentication and sensitive endpoints.

## Trade-off

Introduces an additional infrastructure dependency.

---

# 11. Salary History Instead of Overwriting Records

## Decision

Every salary update creates a new salary history record.

## Why

- Provides a complete audit trail.
- Preserves historical compensation.
- Supports compliance and reporting.
- Enables future trend analysis.

## Trade-off

Requires additional storage compared to updating records in place.

---

# 12. Structured Logging & Monitoring

## Decision

Implement structured application logging, centralized error handling, and health checks.

## Why

- Simplifies debugging.
- Improves production observability.
- Enables future integration with centralized monitoring tools.
- Provides operational visibility without significant complexity.

## Trade-off

Requires additional implementation effort compared to basic console logging.

## Future Evolution

Logs and metrics can later be centralized using Amazon CloudWatch or another observability platform.

---

# 13. Tenant-Aware Data Model

## Decision

Although only one organization (**ACME**) is seeded for the MVP, the data model is designed to be tenant-aware.

## Why

- Supports future SaaS expansion.
- Minimizes future schema changes.
- Encourages proper data isolation.
- Aligns with long-term product scalability.

## Trade-off

Slightly increases schema complexity and authorization logic.

---

# 14. React.js CSR vs Next.js

## Decision

Use **React.js with Client-Side Rendering (CSR)**.

## Why

- The application is an authenticated internal HR dashboard where SEO is not a requirement.
- CSR provides a simpler development and deployment model.
- Well suited for highly interactive dashboards, tables, filters, and forms.
- Enables inexpensive static hosting using Nginx, Amazon S3, or CloudFront.
- Keeps the backend focused on REST APIs rather than server-side rendering.

## Trade-off

Initial page load may be slower than SSR, and public pages do not benefit from SEO optimizations.

## Future Evolution

If the product later includes public-facing pages, marketing content, or SEO-driven experiences, Next.js can be introduced while retaining the existing backend APIs.

---

# 15. MUI vs Custom UI

## Decision

Use **MUI** as the React component library.

## Why

- Speeds up development.
- Provides production-ready components.
- Well suited for admin dashboards and enterprise-style applications.
- Includes tables, dialogs, forms, pagination, tabs, and layout components.

## Trade-off

The UI may look less custom unless additional theming is applied.

## Future Evolution

The design system can later be customized or migrated to a dedicated internal component library.

---

# Summary

The architecture intentionally prioritizes **simplicity, maintainability, scalability, and production-oriented engineering practices** over premature optimization.

The system is designed as a clean modular monolith that can evolve into a scalable SaaS platform through clear domain boundaries, tenant-aware modeling, production-ready infrastructure choices, and incremental architectural evolution when business needs justify additional complexity.