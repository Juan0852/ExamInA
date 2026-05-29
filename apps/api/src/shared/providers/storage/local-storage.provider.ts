import { Injectable, Logger } from "@nestjs/common";
import { createWriteStream, mkdirSync, existsSync, statSync, unlinkSync } from "node:fs";
import { join, extname } from "node:path";
import type { PresignedUpload, StorageProvider } from "./storage-provider.interface";

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly storageRoot: string;
  private readonly publicBaseUrl: string;
  private readonly logger = new Logger(LocalStorageProvider.name);

  constructor() {
    this.storageRoot = process.env.LOCAL_STORAGE_ROOT || "./storage/uploads";
    this.publicBaseUrl = process.env.LOCAL_STORAGE_PUBLIC_BASE_URL || "http://localhost:3000/api/v1/files/local";
    if (!existsSync(this.storageRoot)) {
      mkdirSync(this.storageRoot, { recursive: true });
    }
  }

  async createPresignedUpload(input: {
    fileName: string;
    contentType: string;
  }): Promise<PresignedUpload> {
    const key = this.generateKey(input.fileName);
    return {
      uploadUrl: `${this.publicBaseUrl}/${key}`,
      key,
      bucket: "local"
    };
  }

  async deleteObject(key: string): Promise<void> {
    const filePath = join(this.storageRoot, key);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      this.logger.log(`Deleted local file: ${key}`);
    }
  }

  async getObjectMetadata(key: string): Promise<{ contentLength: number; contentType: string } | null> {
    const filePath = join(this.storageRoot, key);
    if (!existsSync(filePath)) return null;
    const stats = statSync(filePath);
    return {
      contentLength: stats.size,
      contentType: this.guessContentType(key)
    };
  }

  getPublicUrl(key: string): string {
    return `${this.publicBaseUrl}/${key}`;
  }

  saveFile(key: string, buffer: Buffer): void {
    const filePath = join(this.storageRoot, key);
    const dir = join(this.storageRoot, key.split("/").slice(0, -1).join("/"));
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    const ws = createWriteStream(filePath);
    ws.write(buffer);
    ws.end();
  }

  private generateKey(originalFileName: string): string {
    const ext = extname(originalFileName) || ".bin";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `uploads/${timestamp}-${randomStr}${ext}`;
  }

  private guessContentType(key: string): string {
    const ext = extname(key).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".gif": "image/gif",
      ".pdf": "application/pdf"
    };
    return mimeMap[ext] || "application/octet-stream";
  }
}