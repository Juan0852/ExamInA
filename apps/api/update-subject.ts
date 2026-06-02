import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.subject.updateMany({
    where: {
      name: "Matemáticas CCSS"
    },
    data: {
      name: "Matemáticas de Ciencias Sociales"
    }
  });

  console.log(`Updated ${result.count} subjects.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
