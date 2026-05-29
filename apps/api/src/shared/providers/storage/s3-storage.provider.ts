import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable, Logger } from "@nestjs/common";
import type { PresignedUpload, StorageProvider } from "./storage-provider.interface";

@Injectable()
export class S3StorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly logger = new Logger(S3StorageProvider.name);

  constructor() {
    this.region = process.env.AWS_REGION || "eu-north-1";
    this.bucket = process.env.S3_BUCKET || "examina2026";
    this.client = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
      }
    });
  }

  async createPresignedUpload(input: {
    fileName: string;
    contentType: string;
  }): Promise<PresignedUpload> {
    const key = this.generateKey(input.fileName);
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: input.contentType
    });

    const uploadUrl = await getSignedUrl(this.client, command, { expiresIn: 300 });

    return { uploadUrl, key, bucket: this.bucket };
  }

  async deleteObject(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    });
    await this.client.send(command);
    this.logger.log(`Deleted object: ${key}`);
  }

  async getObjectMetadata(key: string): Promise<{ contentLength: number; contentType: string } | null> {
    try {
      const command = new HeadObjectCommand({ Bucket: this.bucket, Key: key });
      const response = await this.client.send(command);
      return {
        contentLength: response.ContentLength ?? 0,
        contentType: response.ContentType ?? "application/octet-stream"
      };
    } catch {
      return null;
    }
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async getPresignedGetUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });
    return getSignedUrl(this.client, command, { expiresIn: expiresInSeconds });
  }

  private generateKey(originalFileName: string): string {
    const ext = originalFileName.split(".").pop() || "bin";
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    return `uploads/${timestamp}-${randomStr}.${ext}`;
  }
}