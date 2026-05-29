import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Res, UseGuards, Inject } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import type { ConfirmUploadRequestDto, PresignUploadRequestDto } from "../dtos/file-upload.dto";
import { presignUploadRequestSchema } from "../dtos/file-upload.dto";
import { FilesService } from "../services/files.service";

@Controller("files")
export class FilesController {
  constructor(@Inject(FilesService) private readonly filesService: FilesService) {}

  @Post("presign")
  async presignUpload(
    @Body(new ZodValidationPipe(presignUploadRequestSchema)) dto: PresignUploadRequestDto,
    @Headers("authorization") authorizationHeader?: string
  ) {
    const data = await this.filesService.presignUpload(authorizationHeader, dto);
    return { data, meta: {}, error: null };
  }

  @Put("confirm")
  async confirmUpload(
    @Body() dto: ConfirmUploadRequestDto,
    @Headers("authorization") authorizationHeader?: string
  ) {
    const data = await this.filesService.confirmUpload(authorizationHeader, dto);
    return { data, meta: {}, error: null };
  }

  @Get(":id")
  async getFile(
    @Param("id") fileAssetId: string,
    @Headers("authorization") authorizationHeader?: string
  ) {
    const data = await this.filesService.getFile(authorizationHeader, fileAssetId);
    return { data, meta: {}, error: null };
  }

  @Delete(":id")
  async deleteFile(
    @Param("id") fileAssetId: string,
    @Headers("authorization") authorizationHeader?: string
  ) {
    const data = await this.filesService.deleteFile(authorizationHeader, fileAssetId);
    return { data, meta: {}, error: null };
  }
}