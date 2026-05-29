import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../../shared/database/database.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { AchievementsController } from "./controllers/achievements.controller";
import { PrismaAchievementsRepository } from "./repositories/prisma-achievements.repository";
import { ACHIEVEMENTS_REPOSITORY, AchievementsService } from "./services/achievements.service";

@Module({
  imports: [AuthModule, DatabaseModule, NotificationsModule],
  controllers: [AchievementsController],
  providers: [
    AchievementsService,
    {
      provide: ACHIEVEMENTS_REPOSITORY,
      useClass: PrismaAchievementsRepository
    }
  ],
  exports: [AchievementsService]
})
export class AchievementsModule {}
