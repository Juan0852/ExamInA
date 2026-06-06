import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService implements OnModuleDestroy {
  private client?: PrismaClient;

  getClient(): PrismaClient {
    if (!this.client) {
      const databaseUrl = process.env.DATABASE_URL;

      if (!databaseUrl) {
        throw new Error("DATABASE_URL is not configured.");
      }

      this.client = new PrismaClient({
        adapter: new PrismaPg({
          connectionString: databaseUrl
        })
      });
    }

    return this.client;
  }

  async checkConnection(): Promise<void> {
    await this.getClient().$queryRaw`SELECT 1`;
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.$disconnect();
  }
}
