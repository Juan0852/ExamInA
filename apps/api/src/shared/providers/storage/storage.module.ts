import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { STORAGE_PROVIDER } from "./storage-provider.constants";
import { S3StorageProvider } from "./s3-storage.provider";

@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        return new S3StorageProvider();
      },
      inject: [ConfigService]
    },
    {
      provide: S3StorageProvider,
      useFactory: (configService: ConfigService) => {
        return new S3StorageProvider();
      },
      inject: [ConfigService]
    }
  ],
  exports: [STORAGE_PROVIDER]
})
export class StorageModule {}