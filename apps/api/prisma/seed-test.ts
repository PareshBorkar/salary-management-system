import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ORGANIZATION_ID = "seed-org-acme";
const HR_MANAGER_EMAIL = "hr.manager@acme.example";
const EMPLOYEE_COUNT = 100;
const BATCH_SIZE = 100;
const EFFECTIVE_DATE = new Date("2026-01-01");

const firstNames = [
  "Aarav",
  "Aditi",
  "Ananya",
  "Arjun",
  "Dev",
  "Diya",
  "Isha",
  "Kabir",
  "Meera",
  "Neha",
  "Rohan",
  "Saanvi",
  "Vihaan",
  "Zara"
];

const lastNames = [
  "Borkar",
  "Desai",
  "Gupta",
  "Iyer",
  "Kapoor",
  "Mehta",
  "Nair",
  "Patel",
  "Rao",
  "Shah",
  "Singh",
  "Verma"
];

const departments = [
  "Engineering",
  "Finance",
  "Human Resources",
  "Operations",
  "Product",
  "Sales",
  "Support"
];

const countries = ["US", "IN", "GB", "DE", "CA", "AU", "SG"];

const roles = [
  "Engineer",
  "Analyst",
  "HR Partner",
  "Operations Lead",
  "Product Manager",
  "Account Executive",
  "Support Specialist"
];

const levels = ["Junior", "Mid", "Senior", "Lead", "Principal"];

const titles = [
  "Associate",
  "Specialist",
  "Senior Specialist",
  "Lead",
  "Manager",
  "Senior Manager",
  "Director"
];

function employeeCode(index: number) {
  return `ACME-${String(index).padStart(5, "0")}`;
}

function employeeId(index: number) {
  return `seed-employee-${String(index).padStart(5, "0")}`;
}

function pick(items: string[], index: number) {
  return items[index % items.length] ?? items[0]!;
}

function seededSalary(index: number) {
  const departmentBand = (index % departments.length) * 4_500;
  const levelBand = (index % titles.length) * 7_500;
  const variance = (index % 31) * 650;

  return 45_000 + departmentBand + levelBand + variance;
}

function chunks<T>(items: T[], size: number) {
  const result: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }

  return result;
}

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: ORGANIZATION_ID },
    update: {
      name: "ACME",
      slug: "acme"
    },
    create: {
      id: ORGANIZATION_ID,
      name: "ACME",
      slug: "acme"
    }
  });

  const passwordHash = await bcrypt.hash("Password123!", 4);

  const user = await prisma.user.upsert({
    where: { email: HR_MANAGER_EMAIL },
    update: {
      organizationId: organization.id,
      firstName: "ACME",
      lastName: "HR Manager",
      passwordHash,
      role: "HR_MANAGER",
      isActive: true
    },
    create: {
      organizationId: organization.id,
      firstName: "ACME",
      lastName: "HR Manager",
      email: HR_MANAGER_EMAIL,
      passwordHash,
      role: "HR_MANAGER"
    }
  });

  const employees = Array.from({ length: EMPLOYEE_COUNT }, (_, offset) => {
    const index = offset + 1;
    const firstName = pick(firstNames, index);
    const lastName = pick(lastNames, index);

    return {
      id: employeeId(index),
      organizationId: organization.id,
      employeeCode: employeeCode(index),
      firstName,
      lastName,
      email: `${employeeCode(index).toLowerCase()}@acme.example`,
      title: pick(titles, index),
      department: pick(departments, index),
      country: pick(countries, index),
      role: pick(roles, index),
      level: pick(levels, index),
      status: "ACTIVE" as const,
      hiredAt: new Date(Date.UTC(2018 + (index % 8), index % 12, (index % 28) + 1))
    };
  });

  for (const batch of chunks(employees, BATCH_SIZE)) {
    await prisma.employee.createMany({
      data: batch,
      skipDuplicates: true
    });
  }

  for (const batch of chunks(employees, BATCH_SIZE)) {
    await prisma.$transaction(
      batch.map((employee) =>
        prisma.employee.update({
          where: { id: employee.id },
          data: {
            country: employee.country,
            role: employee.role,
            level: employee.level
          }
        })
      )
    );
  }

  const salaries = employees.map((employee, offset) => ({
    id: `seed-salary-${String(offset + 1).padStart(5, "0")}`,
    organizationId: organization.id,
    employeeId: employee.id,
    amount: seededSalary(offset + 1).toFixed(2),
    currency: "USD",
    effectiveFrom: EFFECTIVE_DATE
  }));

  for (const batch of chunks(salaries, BATCH_SIZE)) {
    await prisma.salary.createMany({
      data: batch,
      skipDuplicates: true
    });
  }

  const salaryHistory = employees.map((employee, offset) => {
    const salary = seededSalary(offset + 1).toFixed(2);

    return {
      id: `seed-salary-history-${String(offset + 1).padStart(5, "0")}`,
      organizationId: organization.id,
      employeeId: employee.id,
      previousAmount: "0.00",
      newAmount: salary,
      currency: "USD",
      effectiveDate: EFFECTIVE_DATE,
      reason: "HIRE" as const,
      updatedById: user.id
    };
  });

  for (const batch of chunks(salaryHistory, BATCH_SIZE)) {
    await prisma.salaryHistory.createMany({
      data: batch,
      skipDuplicates: true
    });
  }

  console.log(
    `Seeded test ${organization.name}: 1 HR Manager, ${EMPLOYEE_COUNT} employees, ${EMPLOYEE_COUNT} salaries, ${EMPLOYEE_COUNT} salary history records.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
