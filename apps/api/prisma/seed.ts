import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: "seed-org" },
    update: {},
    create: {
      id: "seed-org",
      name: "Acme Payroll"
    }
  });

  await prisma.employee.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      organizationId: organization.id,
      firstName: "Demo",
      lastName: "Employee",
      email: "demo@example.com",
      title: "Payroll Analyst"
    }
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
