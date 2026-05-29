import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import type { FileAssetEntity } from "../entities/file-asset.entity";
import type { FilesRepository } from "./files.repository";

@Injectable()
export class PrismaFilesRepository implements FilesRepository {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  async create(data: {
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
  }): Promise<FileAssetEntity> {
    const fileAsset = await this.prismaService.getClient().fileAsset.create({
      data: {
        userId: data.userId,
        bucket: data.bucket,
        key: data.key,
        url: data.url,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        originalFilename: data.originalFilename,
        fileType: data.fileType as any,
        visibility: data.visibility as any,
        purpose: data.purpose as any
      }
    });
    return this.toEntity(fileAsset);
  }

  async findById(id: string): Promise<FileAssetEntity | null> {
    const fileAsset = await this.prismaService.getClient().fileAsset.findUnique({ where: { id } });
    return fileAsset ? this.toEntity(fileAsset) : null;
  }

  async findManyByIds(ids: string[]): Promise<FileAssetEntity[]> {
    if (!ids || ids.length === 0) return [];
    const files = await this.prismaService.getClient().fileAsset.findMany({
      where: { id: { in: ids } }
    });
    return files.map((file) => this.toEntity(file));
  }

  async findByIdAndUserId(id: string, userId: string): Promise<FileAssetEntity | null> {
    const fileAsset = await this.prismaService.getClient().fileAsset.findFirst({
      where: { id, userId }
    });
    return fileAsset ? this.toEntity(fileAsset) : null;
  }

  async deleteById(id: string): Promise<void> {
    await this.prismaService.getClient().fileAsset.delete({ where: { id } });
  }

  async updateUrl(id: string, url: string): Promise<FileAssetEntity> {
    const fileAsset = await this.prismaService.getClient().fileAsset.update({
      where: { id },
      data: { url }
    });
    return this.toEntity(fileAsset);
  }

  async updateMetadata(
    id: string,
    data: { sizeBytes?: number; width?: number; height?: number; checksum?: string }
  ): Promise<FileAssetEntity> {
    const fileAsset = await this.prismaService.getClient().fileAsset.update({
      where: { id },
      data
    });
    return this.toEntity(fileAsset);
  }

  private toEntity(row: Record<string, unknown>): FileAssetEntity {
    return {
      id: row.id as string,
      userId: row.userId as string,
      bucket: row.bucket as string,
      key: row.key as string,
      url: row.url as string | null,
      mimeType: row.mimeType as string,
      sizeBytes: row.sizeBytes as number,
      originalFilename: row.originalFilename as string,
      fileType: row.fileType as FileAssetEntity["fileType"],
      visibility: row.visibility as FileAssetEntity["visibility"],
      purpose: row.purpose as FileAssetEntity["purpose"],
      checksum: row.checksum as string | null,
      width: row.width as number | null,
      height: row.height as number | null,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date
    };
  }
}