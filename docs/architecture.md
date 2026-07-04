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
7. The response is returned to the client.

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

These enhancements can be introduced incrementally without requiring significant architectural changes.