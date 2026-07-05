import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: { id: "test-org-acme" },
    update: {
      name: "ACME",
      slug: "acme"
    },
    create: {
      id: "test-org-acme",
      name: "ACME",
      slug: "acme"
    }
  });

  await prisma.user.upsert({
    where: { email: "hr.manager@acme.example" },
    update: {
      organizationId: organization.id,
      passwordHash: await bcrypt.hash("Password123!", 4),
      role: "HR_MANAGER",
      isActive: true
    },
    create: {
      organizationId: organization.id,
      firstName: "ACME",
      lastName: "HR Manager",
      email: "hr.manager@acme.example",
      passwordHash: await bcrypt.hash("Password123!", 4),
      role: "HR_MANAGER"
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
