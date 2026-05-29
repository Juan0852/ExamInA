import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { S3StorageProvider } from "../../../shared/providers/storage/s3-storage.provider";
import { AuthService } from "../../auth/services/auth.service";
import type { ConfirmUploadRequestDto, FileAssetResponseDto, PresignUploadRequestDto, PresignUploadResponseDto } from "../dtos/file-upload.dto";
import { FileAssetMapper } from "../mappers/file-asset.mapper";
import type { FilesRepository } from "../repositories/files.repository";
import { FILES_REPOSITORY } from "./files.service.constants";

@Injectable()
export class FilesService {
  private readonly storageProvider: S3StorageProvider;

  constructor(
    @Inject(FILES_REPOSITORY) private readonly filesRepository: FilesRepository,
    private readonly authService: AuthService
  ) {
    this.storageProvider = new S3StorageProvider();
  }

  async presignUpload(
    authorizationHeader: string | undefined,
    dto: PresignUploadRequestDto
  ): Promise<PresignUploadResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);

    const presigned = await this.storageProvider.createPresignedUpload({
      fileName: dto.fileName,
      contentType: dto.contentType
    });

    const isPublic = dto.visibility === "PUBLIC";
    const url = isPublic ? this.storageProvider.getPublicUrl(presigned.key) : null;
    const fileType = this.inferFileType(dto.contentType);

    const fileAsset = await this.filesRepository.create({
      userId: user.id,
      bucket: presigned.bucket,
      key: presigned.key,
      url,
      mimeType: dto.contentType,
      sizeBytes: 0,
      originalFilename: dto.fileName,
      fileType,
      visibility: dto.visibility,
      purpose: dto.purpose
    });

    return {
      uploadUrl: presigned.uploadUrl,
      key: presigned.key,
      bucket: presigned.bucket,
      fileAssetId: fileAsset.id
    };
  }

  async confirmUpload(
    authorizationHeader: string | undefined,
    dto: ConfirmUploadRequestDto
  ): Promise<FileAssetResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const fileAsset = await this.filesRepository.findByIdAndUserId(dto.fileAssetId, user.id);

    if (!fileAsset) {
      throw new NotFoundException("Archivo no encontrado.");
    }

    const metadata = await this.storageProvider.getObjectMetadata(fileAsset.key);
    const updates: { sizeBytes?: number; width?: number; height?: number } = {};
    if (metadata) {
      updates.sizeBytes = metadata.contentLength || fileAsset.sizeBytes;
    }
    if (dto.width !== undefined) updates.width = dto.width;
    if (dto.height !== undefined) updates.height = dto.height;

    const updated = Object.keys(updates).length > 0
      ? await this.filesRepository.updateMetadata(fileAsset.id, updates)
      : fileAsset;

    if (!updated.url) {
      const url = updated.visibility === "PUBLIC"
        ? this.storageProvider.getPublicUrl(updated.key)
        : await this.storageProvider.getPresignedGetUrl(updated.key);
      await this.filesRepository.updateUrl(updated.id, url);
      updated.url = url;
    }

    return FileAssetMapper.toResponse(updated);
  }

  async getFile(
    authorizationHeader: string | undefined,
    fileAssetId: string
  ): Promise<FileAssetResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const fileAsset = await this.filesRepository.findByIdAndUserId(fileAssetId, user.id);

    if (!fileAsset) {
      throw new NotFoundException("Archivo no encontrado.");
    }

    if (fileAsset.visibility === "PUBLIC") {
      if (!fileAsset.url) {
        const url = this.storageProvider.getPublicUrl(fileAsset.key);
        await this.filesRepository.updateUrl(fileAsset.id, url);
        fileAsset.url = url;
      }
    } else {
      const freshUrl = await this.storageProvider.getPresignedGetUrl(fileAsset.key);
      fileAsset.url = freshUrl;
    }

    return FileAssetMapper.toResponse(fileAsset);
  }

  async deleteFile(
    authorizationHeader: string | undefined,
    fileAssetId: string
  ): Promise<{ success: boolean }> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const fileAsset = await this.filesRepository.findByIdAndUserId(fileAssetId, user.id);

    if (!fileAsset) {
      throw new NotFoundException("Archivo no encontrado.");
    }

    await this.storageProvider.deleteObject(fileAsset.key);
    await this.filesRepository.deleteById(fileAsset.id);

    return { success: true };
  }

  private inferFileType(mimeType: string): string {
    if (mimeType.startsWith("image/")) return "IMAGE";
    if (mimeType === "application/pdf") return "PDF";
    if (mimeType.startsWith("audio/")) return "AUDIO";
    if (mimeType.startsWith("video/")) return "VIDEO";
    return "OTHER";
  }
}