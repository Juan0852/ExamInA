import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../../shared/database/database.module";
import { ExamSessionsController } from "./controllers/exam-sessions.controller";
import { PrismaExamSessionsRepository } from "./repositories/prisma-exam-sessions.repository";
import { EXAM_SESSIONS_REPOSITORY, ExamSessionsService } from "./services/exam-sessions.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [ExamSessionsController],
  providers: [
    ExamSessionsService,
    {
      provide: EXAM_SESSIONS_REPOSITORY,
      useClass: PrismaExamSessionsRepository
    }
  ]
})
export class ExamSessionsModule {}
