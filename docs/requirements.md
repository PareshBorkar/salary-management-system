# Salary Management System – MVP Requirements

## Overview

The goal of this project is to build an MVP web-based Salary Management System that enables HR teams to centrally manage employee compensation data for an organization with approximately **10,000 employees** across multiple countries.

The system replaces spreadsheet-based salary management with a searchable, auditable, and analytics-driven application that allows HR Managers to efficiently manage salary information and gain insights into organizational compensation.

Although the assessment is based on **ACME** as a single organization, the data model is designed to be **tenant-aware** so it can evolve into a multi-organization SaaS product in the future.

---

## Primary User

### HR Manager

The HR Manager is responsible for:

- Managing employee salary information.
- Updating employee compensation.
- Reviewing salary history.
- Answering compensation-related questions using dashboards and analytics.
- Understanding payroll distribution across departments, roles, and countries.

---

## Goals

The MVP aims to:

- Replace spreadsheet-based salary management with a centralized web application.
- Support efficient management of salary records for **10,000 employees**.
- Provide meaningful compensation analytics to support HR decision-making.
- Maintain an auditable history of salary changes.
- Demonstrate clean architecture, maintainable code, and production-oriented engineering practices.

---

# Functional Scope

The MVP includes the following capabilities.

## Authentication

- Secure login using JWT authentication.
- Role-aware authentication, with the MVP focused on the **HR Manager** role while keeping the architecture extensible for future roles such as **Admin**, **Finance Manager**, and **Read-only Auditor**.
- Protected application routes.

## Employee Management

- View employees in a searchable, filterable, and paginated table.
- Search by employee name or employee ID.
- Filter by country, department, role, and level.
- Sort employee records by salary and other supported fields.

## Salary Management

- View current salary information.
- Update employee salary.
- Capture the reason and effective date for salary changes.
- Maintain complete salary history for audit purposes.

## Compensation Analytics

The dashboard provides insights including:

- Total employees
- Total payroll
- Average salary
- Median salary
- Payroll by country
- Average salary by department
- Salary distribution by role and level
- Salary bands

Employee salaries are stored in **USD** as the base currency for consistent company-wide reporting and analytics. For display purposes, salaries can be converted into the employee's local currency using exchange rates fetched from a global currency exchange API through a configurable provider.

---

# Non-Functional Requirements

The application should:

- Support at least **10,000 employee records**.
- Use server-side pagination, filtering, and sorting.
- Provide structured logging and centralized error handling.
- Include automated tests for core business logic.
- Be deployable using Docker on a single AWS EC2 instance.
- Be designed as a modular monolith with clear domain boundaries, keeping the MVP simple to develop, test, and deploy while allowing modules to be extracted into microservices later if scaling or ownership needs arise.

---

# Assumptions

The following assumptions are made due to the limited scope of the assessment:

- The application manages one seeded organization (**ACME**).
- A single **HR Manager** role is sufficient for the MVP.
- Salaries represent **annual gross compensation**.
- Employee salaries are stored in **USD** as the base currency. Local currency values are calculated for display using exchange rates fetched from a configurable global currency exchange API.

---

# Out of Scope

The following capabilities are intentionally excluded from the MVP:

- Payroll processing
- Tax calculations
- Country-specific payroll regulations
- Payslip generation
- Approval workflows
- Employee self-service portal
- Bulk Excel import/export
- Subscription billing
- Organization onboarding
- Multi-factor authentication (MFA)
- Single Sign-On (SSO)
- Advanced Role-Based Access Control (RBAC)
- AI-powered chat assistant

These features are intentionally excluded to keep the MVP focused on solving the core problem of enabling HR Managers to manage salary data efficiently and derive meaningful compensation insights. The architecture and data model are designed so these capabilities can be added incrementally in future iterations without requiring major architectural changes.
