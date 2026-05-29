import { Global, Module } from "@nestjs/common";
import { STORAGE_PROVIDER } from "./storage-provider.constants";
import { S3StorageProvider } from "./s3-storage.provider";

@Global()
@Module({
  providers: [
    S3StorageProvider,
    {
      provide: STORAGE_PROVIDER,
      useExisting: S3StorageProvider
    }
  ],
  exports: [STORAGE_PROVIDER]
})
export class StorageModule {}