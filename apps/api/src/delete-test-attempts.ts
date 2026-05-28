import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

async function cleanAttempts() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;

  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const idsToDelete = [
      "cmpp3nj0t0008m5lbwoimmoq4",
      "cmpp3oc4l0008v2lbgll3qn2u",
      "cmpp3sb7u00087ulblye5bh77"
    ];

    console.log("Cleaning up test attempts from database...");
    
    // Delete corrections first due to relation constraints
    const correctionsDeleted = await prisma.correction.deleteMany({
      where: {
        attemptId: { in: idsToDelete }
      }
    });
    console.log(`Deleted ${correctionsDeleted.count} corrections.`);

    const attemptsDeleted = await prisma.attempt.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });
    console.log(`Deleted ${attemptsDeleted.count} attempts.`);
    
    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Error during cleanup:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

cleanAttempts();
