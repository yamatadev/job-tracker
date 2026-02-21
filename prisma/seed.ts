import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();

  const hashedPassword = await hash("admin123", 12);
  await prisma.user.create({
    data: {
      email: "admin@jobtracker.com",
      password: hashedPassword,
      name: "Admin",
    },
  });

  console.log("✅ User created: admin@jobtracker.com / admin123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());