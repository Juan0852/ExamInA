import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({ include: { profile: true } });
    if (!user) {
      console.log("No user found.");
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        photoUrl: "https://example.com/avatar.png",
        profile: {
          update: {
            username: undefined,
            bio: undefined,
            targetUniversity: undefined
          }
        }
      }
    });

    console.log("Update successful");
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
