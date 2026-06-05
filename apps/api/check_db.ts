import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.achievement.count();
  console.log(`Achievements count: ${count}`);
  await prisma.$disconnect();
}
main().catch(console.error);
