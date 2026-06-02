import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("No user found.");
      return;
    }

    const fileAsset = await prisma.fileAsset.create({
      data: {
        userId: user.id,
        bucket: "examina2026",
        key: "test-key-avatar",
        url: null,
        mimeType: "image/png",
        sizeBytes: 0,
        originalFilename: "avatar.png",
        fileType: "IMAGE" as any,
        visibility: "PUBLIC" as any,
        purpose: "AVATAR" as any
      }
    });

    console.log("FileAsset created successfully:", fileAsset.id);
  } catch (error) {
    console.error("Prisma error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
