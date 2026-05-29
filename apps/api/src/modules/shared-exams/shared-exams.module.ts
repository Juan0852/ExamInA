import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../../shared/database/database.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { SharedExamsController } from "./controllers/shared-exams.controller";
import { PrismaSharedExamsRepository } from "./repositories/prisma-shared-exams.repository";
import { SHARED_EXAMS_REPOSITORY, SharedExamsService } from "./services/shared-exams.service";

@Module({
  imports: [AuthModule, DatabaseModule, NotificationsModule],
  controllers: [SharedExamsController],
  providers: [
    SharedExamsService,
    {
      provide: SHARED_EXAMS_REPOSITORY,
      useClass: PrismaSharedExamsRepository
    }
  ]
})
export class SharedExamsModule {}
