import type { FileAssetEntity } from "../entities/file-asset.entity";

export interface FilesRepository {
  create(data: {
    userId: string;
    bucket: string;
    key: string;
    url: string | null;
    mimeType: string;
    sizeBytes: number;
    originalFilename: string;
    fileType: string;
    visibility: string;
    purpose: string;
  }): Promise<FileAssetEntity>;
  findById(id: string): Promise<FileAssetEntity | null>;
  findByIdAndUserId(id: string, userId: string): Promise<FileAssetEntity | null>;
  deleteById(id: string): Promise<void>;
  updateUrl(id: string, url: string): Promise<FileAssetEntity>;
  updateMetadata(
    id: string,
    data: { sizeBytes?: number; width?: number; height?: number; checksum?: string }
  ): Promise<FileAssetEntity>;
}