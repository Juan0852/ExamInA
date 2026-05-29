export interface PresignedUpload {
  uploadUrl: string;
  key: string;
  bucket: string;
}

export interface StorageProvider {
  createPresignedUpload(input: {
    fileName: string;
    contentType: string;
  }): Promise<PresignedUpload>;
  deleteObject(key: string): Promise<void>;
  getObjectMetadata(key: string): Promise<{ contentLength: number; contentType: string } | null>;
  getPublicUrl(key: string): string;
}