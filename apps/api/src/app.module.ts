import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { join } from "node:path";
import { AchievementsModule } from "./modules/achievements/achievements.module";
import { AuthModule } from "./modules/auth/auth.module";
import { CommunityModule } from "./modules/community/community.module";
import { CorrectionsModule } from "./modules/corrections/corrections.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { ExamSessionsModule } from "./modules/exam-sessions/exam-sessions.module";
import { FilesModule } from "./modules/files/files.module";
import { HealthModule } from "./modules/health/health.module";
import { QuestionsModule } from "./modules/questions/questions.module";
import { SharedExamsModule } from "./modules/shared-exams/shared-exams.module";
import { SubjectsModule } from "./modules/subjects/subjects.module";
import { TopicsModule } from "./modules/topics/topics.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env")
    }),
    AuthModule,
    AchievementsModule,
    CommunityModule,
    CorrectionsModule,
    DashboardModule,
    ExamSessionsModule,
    FilesModule,
    HealthModule,
    QuestionsModule,
    SharedExamsModule,
    SubjectsModule,
    TopicsModule
  ]
})
export class AppModule {}