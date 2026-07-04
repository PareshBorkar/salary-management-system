# Seed Data and Testing Strategy

## Purpose

The MVP uses deterministic seed data to create a realistic ACME organization dataset for development, testing, and performance validation.

The seed creates:

- 1 ACME organization
- 1 HR Manager user
- 10,000 employees
- 10,000 current salary records
- 10,000 initial salary history records

This dataset supports the core user stories around employee browsing, salary management, audit history, and compensation analytics.

---

## Deterministic Seed Data

Seed data is deterministic, meaning the same seed script produces the same records every time it runs.

This is important because:

- Developers can reproduce bugs using the same employee IDs and salary values.
- Automated tests can assert exact counts, sort order, and analytics outputs.
- UI behavior can be tested against stable data instead of random records.
- Performance testing is repeatable across local machines and CI-like environments.

Employee IDs, employee codes, names, departments, titles, hire dates, and salaries are generated from predictable formulas. For example, employees use stable IDs such as:

```text
seed-employee-00001
seed-employee-00002
...
seed-employee-10000
```

Employee codes follow the same pattern:

```text
ACME-00001
ACME-00002
...
ACME-10000
```

Because IDs are stable, related salary and salary history records can also be seeded safely and repeatedly.

---

## Why 10,000 Employees

The requirements specify that the application should support at least 10,000 employee records.

Seeding 10,000 employees makes the development dataset large enough to test real application behavior, including:

- Server-side pagination
- Server-side filtering
- Server-side sorting
- Employee search
- Dashboard aggregation queries
- Salary analytics queries

This avoids building against an unrealistically small dataset where inefficient queries or frontend-heavy processing might appear acceptable.

---

## Pagination Testing

The employee list must use server-side pagination.

The seeded dataset should be used to verify:

- The default page returns only the requested page size.
- Page navigation returns different employee records.
- Total record count is returned correctly.
- Pagination remains stable with sorting applied.
- Pagination remains stable with filters and search applied together.

Example scenarios:

- Page 1 with page size 25 returns 25 employees.
- Page 2 with page size 25 returns the next 25 employees.
- The total count remains 10,000 when no filters are applied.
- Sorting by employee code produces predictable ordering from `ACME-00001` onward.

Pagination should always happen in the database query, not in frontend memory.

---

## Filtering and Search Testing

The user stories require filtering employees by country, department, role, and level, and searching by name or employee ID.

The seed data should support these workflows by distributing employees across predictable departments and titles. This allows tests to verify:

- Department filters return only matching employees.
- Title or level filters return only matching employees.
- Search supports partial name matches.
- Search supports employee code matches.
- Multiple filters can be combined.
- Filters work together with sorting and pagination.

Example scenarios:

- Searching for `ACME-00042` returns the matching employee.
- Filtering by `Engineering` returns only Engineering employees.
- Filtering by department and sorting by salary returns a stable, salary-ordered subset.
- Applying search after pagination resets or correctly recalculates the page result.

As the employee schema grows, seed data should include country, role, and level fields so these filters can be tested directly rather than simulated.

---

## Salary Testing

The MVP salary model intentionally stays simple:

- `salary` stores the current salary snapshot for an employee.
- `salary_history` stores auditable salary changes.

For each seeded employee, the seed creates one current salary and one initial salary history record. This supports tests for:

- Viewing current salary details.
- Sorting employees by salary.
- Calculating total payroll.
- Calculating average salary.
- Calculating median salary.
- Viewing an employee's initial salary history.

When salary update APIs are implemented, tests should verify that:

- The current salary row is updated.
- A new salary history record is created.
- The history record stores previous salary and new salary.
- The effective date and reason are required.
- The HR Manager user is recorded as the updater.

---

## Analytics Testing

The dashboard requires compensation metrics such as:

- Total employees
- Total payroll
- Average salary
- Median salary
- Average salary by department
- Salary distribution by role and level
- Salary bands

Deterministic seed salaries make analytics testable because expected results can be calculated from known values.

Analytics tests should cover:

- Correct total employee count.
- Correct total payroll from `salary.amount`.
- Correct average salary.
- Correct median salary.
- Correct grouping by department.
- Correct salary band counts.
- Query performance against 10,000 salary rows.

Analytics should read current compensation from `salary`, not from `salary_history`, unless the feature specifically asks for historical trends.

---

## Tenant-Aware Testing

The MVP seeds one organization, ACME, but the schema is tenant-aware.

All employee, salary, and analytics queries should include `organizationId` so future SaaS expansion does not require major rewrites.

Tests should verify:

- Employee queries are scoped by organization.
- Salary queries are scoped by organization.
- Analytics queries are scoped by organization.
- Updates cannot modify records outside the authenticated user's organization.

Even with one seeded organization, keeping `organizationId` in queries enforces the correct habit early.

---

## Idempotent Seeding

The seed script is designed to be safely rerun.

It uses stable IDs and duplicate-safe inserts so repeated execution should not create duplicate organizations, users, employees, salaries, or salary history records.

This is useful for:

- Resetting local development data.
- Rebuilding test environments.
- Reproducing bugs with known records.
- Keeping developer onboarding simple.

If seed data changes, the script should remain deterministic and idempotent.

---

## Practical Test Layers

Recommended testing approach:

- Unit tests for salary update calculations and validation rules.
- Repository or service tests for pagination, filtering, sorting, and analytics queries.
- API integration tests for employee list, salary detail, salary update, and salary history endpoints.
- UI tests for table pagination, filter controls, search, and dashboard rendering.

The 10,000-employee seed should be used most heavily for integration and performance-oriented tests. Smaller factories can still be used for narrow unit tests.
