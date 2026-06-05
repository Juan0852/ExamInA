import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.achievement.upsert({
      where: { code: "TEST_ACHIEVEMENT" },
      update: {
        title: "Test",
        description: "Test description",
        icon: "TestIcon",
        experienceReward: 10,
      },
      create: {
        code: "TEST_ACHIEVEMENT",
        title: "Test",
        description: "Test description",
        icon: "TestIcon",
        experienceReward: 10,
      },
    });
    console.log("Upsert succeeded!");
  } catch (error) {
    console.error("Upsert failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
