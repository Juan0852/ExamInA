import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared/database/database.module";
import { TopicsModule } from "../topics/topics.module";
import { SubjectsController } from "./controllers/subjects.controller";
import { PrismaSubjectsRepository } from "./repositories/prisma-subjects.repository";
import { SUBJECTS_REPOSITORY, SubjectsService } from "./services/subjects.service";

@Module({
  imports: [DatabaseModule, TopicsModule],
  controllers: [SubjectsController],
  providers: [
    SubjectsService,
    {
      provide: SUBJECTS_REPOSITORY,
      useClass: PrismaSubjectsRepository
    }
  ],
  exports: [SubjectsService]
})
export class SubjectsModule {}
