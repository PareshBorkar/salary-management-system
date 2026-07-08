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

The current path toward CloudWatch is intentionally incremental:

- Keep request logs structured and machine-readable at the application layer
- Use request IDs as the correlation key between client issues and backend events
- Expose health checks for simple uptime probes and deeper dependency-aware checks
- Preserve salary history separately as the business audit log for compensation events

This avoids overloading infrastructure logs with business audit responsibilities while keeping a clean migration path toward centralized AWS monitoring.

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

# 16. MUI Styling vs Tailwind CSS

## Decision

Do not add Tailwind CSS for the MVP. Continue using MUI components, MUI theming, and the existing `sx` styling approach.

## Why

- MUI already provides the component primitives needed for this internal HR dashboard.
- The current UI is mostly form, table, card, navigation, and dashboard composition where MUI is a strong fit.
- Avoids running two styling systems side by side before there is a clear design-system need.
- Reduces build/configuration complexity and keeps styling decisions close to the component library already in use.

## Trade-off

MUI styling can be more verbose than utility-first CSS, and highly custom visual design may require more theme work.

## Future Evolution

Tailwind CSS can be introduced later if the product needs a more custom visual system, broader marketing/public pages, or a team workflow that benefits from utility-first styling. If introduced, it should be done deliberately with clear ownership boundaries so MUI component styling and Tailwind utilities do not compete in the same UI surfaces.

---

# 17. Local React State vs Redux

## Decision

Use local React state, route-level hooks, and small module-specific hooks instead of adding Redux or a similar global state management library for the MVP.

## Why

- The current frontend state is mostly page-local: employee filters, pagination, dashboard loading state, salary update form state, and login errors.
- Existing hooks keep data loading, loading states, and error states close to the pages that own them.
- Avoids adding global-state boilerplate before there is enough shared state complexity to justify it.
- Keeps the frontend easier to reason about for the MVP and reduces dependency surface area.

## Trade-off

Some async state handling is repeated across hooks, and cross-page state persistence is limited.

## Future Evolution

Redux Toolkit, Zustand, TanStack Query, or a similar state management/data-fetching layer can be introduced later if the app develops stronger needs such as:

- Shared state across many unrelated pages
- More complex session or authorization flows
- Cross-page persistence for filters and table state
- More advanced API caching, retries, invalidation, or optimistic updates
- Debugging needs that benefit from centralized state inspection

Until those needs are clearer, local state and focused hooks provide a simpler and more appropriate default.

---

# 18. Single JWT Token vs Access Token + Refresh Token

## Decision

Use a single signed JWT for MVP authentication instead of issuing both an access token and a refresh token.

After login, the frontend sends this JWT with authenticated API requests. When the token expires or becomes invalid, the user must log in again.

## Why

- Simpler implementation across frontend and backend.
- Fewer authentication flows to test and maintain.
- No refresh-token storage, rotation, reuse detection, or revocation workflow required.
- Lower operational complexity while the product is still small.
- Good fit for a controlled HR demo/MVP environment with a limited user base.

This keeps authentication understandable while the project focuses on the salary-management domain: employees, salary details, history, and analytics.

## Trade-off

The single-token approach is easier to build and operate, but it provides weaker session lifecycle controls than an access-token plus refresh-token model.

If the JWT is stolen, it can be used until it expires. There is also no silent session renewal, so users must log in again after token expiry. Immediate logout across devices and token revocation are limited unless a server-side denylist or session store is added.

## Security Mitigations

- Keep token expiry short enough for the risk profile.
- Store the JWT carefully on the client.
- Use HTTPS in deployed environments.
- Use a strong `JWT_SECRET`.
- Avoid putting sensitive data in the JWT payload.
- Validate authorization on every protected backend route.
- Add rate limiting on authentication endpoints.

## Future Evolution

Move to access tokens plus refresh tokens when the application needs long-lived sessions, silent token renewal, stronger logout/session revocation, multi-device session management, SSO, or enterprise-grade security controls.

The likely next step is to keep short-lived access tokens, add refresh tokens stored in a secure server-side session table, rotate refresh tokens on every refresh, detect refresh-token reuse, and revoke sessions on logout or security-sensitive account changes.

---

# Summary

The architecture intentionally prioritizes **simplicity, maintainability, scalability, and production-oriented engineering practices** over premature optimization.

The system is designed as a clean modular monolith that can evolve into a scalable SaaS platform through clear domain boundaries, tenant-aware modeling, production-ready infrastructure choices, and incremental architectural evolution when business needs justify additional complexity.
