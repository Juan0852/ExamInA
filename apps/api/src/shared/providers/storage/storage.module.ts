import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { STORAGE_PROVIDER } from "./storage-provider.constants";
import { S3StorageProvider } from "./s3-storage.provider";
import { LocalStorageProvider } from "./local-storage.provider";

@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>("STORAGE_PROVIDER", "local");
        if (provider === "s3") {
          return new S3StorageProvider();
        }
        return new LocalStorageProvider();
      },
      inject: [ConfigService]
    }
  ],
  exports: [STORAGE_PROVIDER]
})
export class StorageModule {}