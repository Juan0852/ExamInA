import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared/database/database.module";
import { TopicsController } from "./controllers/topics.controller";
import { PrismaTopicsRepository } from "./repositories/prisma-topics.repository";
import { TOPICS_REPOSITORY, TopicsService } from "./services/topics.service";

@Module({
  imports: [DatabaseModule],
  controllers: [TopicsController],
  providers: [
    TopicsService,
    {
      provide: TOPICS_REPOSITORY,
      useClass: PrismaTopicsRepository
    }
  ],
  exports: [TopicsService]
})
export class TopicsModule {}
