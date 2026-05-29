import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared/database/database.module";
import { StorageModule } from "../../shared/providers/storage/storage.module";
import { AuthService } from "../auth/services/auth.service";
import { AuthModule } from "../auth/auth.module";
import { FilesController } from "./controllers/files.controller";
import { PrismaFilesRepository } from "./repositories/prisma-files.repository";
import { FILES_REPOSITORY } from "./services/files.service.constants";
import { FilesService } from "./services/files.service";

@Module({
  imports: [DatabaseModule, StorageModule, AuthModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: FILES_REPOSITORY,
      useClass: PrismaFilesRepository
    }
  ],
  exports: [FilesService]
})
export class FilesModule {}