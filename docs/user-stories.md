# User Stories

## Epic 1: Authentication

### US-001: HR Manager Login

**As an** HR Manager  
**I want** to securely log in to the application  
**So that** I can access salary management features.

#### Acceptance Criteria

- User can log in with valid credentials.
- Invalid credentials return an appropriate error.
- Protected routes require authentication.
- Authenticated users receive a JWT.
- Only authorized users can access protected APIs.

---

## Epic 2: Employee Management

### US-002: View Employees

**As an** HR Manager  
**I want** to view employees in a paginated table  
**So that** I can efficiently browse salary records.

#### Acceptance Criteria

- Employees are displayed in a paginated table.
- Pagination is performed server-side.
- Default sorting is applied.
- Supports at least 10,000 employee records.

---

### US-003: Search Employees

**As an** HR Manager  
**I want** to search employees by name or employee ID  
**So that** I can quickly locate a specific employee.

#### Acceptance Criteria

- Search updates results correctly.
- Partial matches are supported.
- Search is performed server-side.

---

### US-004: Filter Employees

**As an** HR Manager  
**I want** to filter employees by country, department, role, and level  
**So that** I can narrow down compensation data.

#### Acceptance Criteria

- Multiple filters can be applied simultaneously.
- Results update correctly.
- Filters work together with search and pagination.

---

### US-005: Sort Employees

**As an** HR Manager  
**I want** to sort employees by salary and other supported fields  
**So that** I can analyze compensation more effectively.

#### Acceptance Criteria

- Ascending and descending sorting is supported.
- Sorting is performed server-side.

---

## Epic 3: Salary Management

### US-006: View Employee Salary

**As an** HR Manager  
**I want** to view an employee's current salary details  
**So that** I can review compensation information.

#### Acceptance Criteria

- Current salary is displayed.
- Currency information is shown.
- Employee metadata is available.

---

### US-007: Update Salary

**As an** HR Manager  
**I want** to update an employee's salary  
**So that** compensation changes are accurately recorded.

#### Acceptance Criteria

- New salary must be valid.
- Reason for change is required.
- Effective date is required.
- Successful updates modify the current salary.

---

### US-008: View Salary History

**As an** HR Manager  
**I want** to review historical salary changes  
**So that** compensation changes remain auditable.

#### Acceptance Criteria

- Previous salary records are preserved.
- Each record includes:
  - Previous salary
  - New salary
  - Effective date
  - Reason
  - Updated by
  - Updated timestamp

---

## Epic 4: Compensation Analytics

### US-009: View Dashboard

**As an** HR Manager  
**I want** to view compensation metrics on a dashboard  
**So that** I can understand overall payroll trends.

#### Acceptance Criteria

Dashboard displays:

- Total employees
- Total payroll
- Average salary
- Median salary

---

### US-010: Analyze Compensation

**As an** HR Manager  
**I want** to visualize compensation across different dimensions  
**So that** I can make informed compensation decisions.

#### Acceptance Criteria

Dashboard provides:

- Payroll by country
- Average salary by department
- Salary distribution by role
- Salary distribution by level
- Salary bands

---

### US-011: Normalize Reporting Currency

**As an** HR Manager  
**I want** to view organization-wide analytics in a common reporting currency  
**So that** compensation can be compared consistently across countries.

#### Acceptance Criteria

- Salaries are stored in USD.
- Local currency values are displayed using current exchange rates.
- Reporting currency can be normalized for analytics.
- Currency conversion is used only for reporting and display.

---

## Epic 5: Audit & Reliability

### US-012: Audit Salary Changes

**As an** HR Manager  
**I want** every salary modification to be recorded  
**So that** salary changes remain traceable.

#### Acceptance Criteria

Each salary update records:

- Employee
- Previous salary
- New salary
- Effective date
- Reason
- User performing the change
- Timestamp

---

### US-013: Handle Errors Gracefully

**As an** HR Manager  
**I want** meaningful error messages  
**So that** I understand why an operation failed.

#### Acceptance Criteria

- Validation errors are descriptive.
- Unauthorized requests return appropriate responses.
- Unexpected errors are logged and handled gracefully.

---

## Epic 6: Performance

### US-014: Scale to Large Employee Datasets

**As an** HR Manager  
**I want** the application to remain responsive with 10,000 employees  
**So that** I can perform day-to-day tasks efficiently.

#### Acceptance Criteria

- Server-side pagination
- Server-side filtering
- Server-side sorting
- Efficient database queries
- Fast dashboard loading

---

## Epic 7: Future SaaS Readiness

### US-015: Tenant-Aware Architecture

**As a** Product Owner  
**I want** the application to support multiple organizations in the future  
**So that** it can evolve into a SaaS platform without major architectural changes.

#### Acceptance Criteria

- Data model supports organization isolation.
- Business logic is organization-aware.
- Architecture remains modular and extensible.
