import type { FileAssetEntity } from "../entities/file-asset.entity";
import type { FileAssetResponseDto } from "../dtos/file-upload.dto";

export class FileAssetMapper {
  static toResponse(entity: FileAssetEntity): FileAssetResponseDto {
    return {
      id: entity.id,
      url: entity.url,
      key: entity.key,
      bucket: entity.bucket,
      mimeType: entity.mimeType,
      sizeBytes: entity.sizeBytes,
      originalFilename: entity.originalFilename,
      fileType: entity.fileType,
      visibility: entity.visibility,
      purpose: entity.purpose,
      width: entity.width,
      height: entity.height,
      createdAt: entity.createdAt.toISOString()
    };
  }
}