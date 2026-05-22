import type { PresignedUpload, StorageProvider } from "./storage-provider.interface";

export class S3StorageProvider implements StorageProvider {
  async createPresignedUpload(): Promise<PresignedUpload> {
    throw new Error("S3StorageProvider is not configured yet.");
  }
}
