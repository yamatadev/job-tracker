import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed in production");
  }

  await prisma.user.deleteMany();

  const hashedPassword = await hash("admin123", 12);
  const user = await prisma.user.create({
    data: {
      email: "admin@jobtracker.com",
      password: hashedPassword,
      name: "Admin",
    },
  });

  await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      summary:
        "Full-stack developer with experience in Node.js, React, TypeScript, and PostgreSQL. Built production systems end-to-end, automated workflows, and delivered measurable business results. Comfortable with async, remote collaboration, and clear written communication.",
    },
    update: {},
  });

  console.log("✅ User created: admin@jobtracker.com / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
