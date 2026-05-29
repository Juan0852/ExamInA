import { Module } from "@nestjs/common";
import { DatabaseModule } from "../../shared/database/database.module";
import { S3StorageProvider } from "../../shared/providers/storage/s3-storage.provider";
import { STORAGE_PROVIDER } from "../../shared/providers/storage/storage-provider.constants";
import { AuthModule } from "../auth/auth.module";
import { FilesController } from "./controllers/files.controller";
import { PrismaFilesRepository } from "./repositories/prisma-files.repository";
import { FILES_REPOSITORY } from "./services/files.service.constants";
import { FilesService } from "./services/files.service";

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [FilesController],
  providers: [
    S3StorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useExisting: S3StorageProvider
    },
    FilesService,
    {
      provide: FILES_REPOSITORY,
      useClass: PrismaFilesRepository
    }
  ],
  exports: [FilesService]
})
export class FilesModule {}