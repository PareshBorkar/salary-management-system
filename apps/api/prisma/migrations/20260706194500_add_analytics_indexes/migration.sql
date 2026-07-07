CREATE INDEX "employees_organization_id_country_id_idx" ON "employees"("organization_id", "country", "id");
CREATE INDEX "employees_organization_id_department_id_idx" ON "employees"("organization_id", "department", "id");
CREATE INDEX "salary_organization_id_amount_idx" ON "salary"("organization_id", "amount");
CREATE INDEX "salary_organization_id_employee_id_amount_idx" ON "salary"("organization_id", "employee_id", "amount");
