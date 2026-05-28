import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared/database/database.module";
import { AuthModule } from "../auth/auth.module";
import { QuestionsController } from "./controllers/questions.controller";
import { PrismaQuestionsRepository } from "./repositories/prisma-questions.repository";
import { QUESTIONS_REPOSITORY, QuestionsService } from "./services/questions.service";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [QuestionsController],
  providers: [
    QuestionsService,
    {
      provide: QUESTIONS_REPOSITORY,
      useClass: PrismaQuestionsRepository
    }
  ],
  exports: [QuestionsService]
})
export class QuestionsModule {}
