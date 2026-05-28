import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../../shared/database/database.module";
import { createCorrectionProvider } from "../../shared/providers/ai/correction-provider.factory";
import { CorrectionsController } from "./controllers/corrections.controller";
import { PrismaCorrectionsRepository } from "./repositories/prisma-corrections.repository";
import {
  CORRECTION_PROVIDER,
  CORRECTIONS_REPOSITORY,
  CorrectionsService
} from "./services/corrections.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [CorrectionsController],
  providers: [
    CorrectionsService,
    {
      provide: CORRECTION_PROVIDER,
      useFactory: createCorrectionProvider
    },
    {
      provide: CORRECTIONS_REPOSITORY,
      useClass: PrismaCorrectionsRepository
    }
  ],
  exports: [CorrectionsService]
})
export class CorrectionsModule {}
