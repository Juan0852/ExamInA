import { config } from "dotenv";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

const apiRoot = dirname(fileURLToPath(import.meta.url));

config({ path: join(apiRoot, ".env") });

export default defineConfig({
  schema: join(apiRoot, "prisma/schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL ? env("SHADOW_DATABASE_URL") : undefined
  },
  migrations: {
    path: join(apiRoot, "prisma/migrations")
  }
});
