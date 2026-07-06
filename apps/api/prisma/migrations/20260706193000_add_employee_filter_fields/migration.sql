ALTER TABLE "employees" ADD COLUMN "country" TEXT;
ALTER TABLE "employees" ADD COLUMN "role" TEXT;
ALTER TABLE "employees" ADD COLUMN "level" TEXT;

CREATE INDEX "employees_organization_id_country_idx" ON "employees"("organization_id", "country");
CREATE INDEX "employees_organization_id_department_idx" ON "employees"("organization_id", "department");
CREATE INDEX "employees_organization_id_role_idx" ON "employees"("organization_id", "role");
CREATE INDEX "employees_organization_id_level_idx" ON "employees"("organization_id", "level");
