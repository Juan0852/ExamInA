import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../../shared/database/database.module";
import { DashboardController } from "./controllers/dashboard.controller";
import { PrismaDashboardRepository } from "./repositories/prisma-dashboard.repository";
import { DASHBOARD_REPOSITORY, DashboardService } from "./services/dashboard.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    {
      provide: DASHBOARD_REPOSITORY,
      useClass: PrismaDashboardRepository
    }
  ]
})
export class DashboardModule {}
