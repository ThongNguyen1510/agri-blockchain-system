import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
    } catch (error) {
      if (process.env.NODE_ENV === "test") {
        // eslint-disable-next-line no-console
        console.warn("Prisma connection skipped in test environment:", error);
        return;
      }
      throw error;
    }
  }

  async enableShutdownHooks(app: INestApplication): Promise<void> {
    (this.$on as any)("beforeExit", async () => {
      await app.close();
    });
  }
}