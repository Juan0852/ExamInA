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
}
