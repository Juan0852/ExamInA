import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Res, UseGuards } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import type { ConfirmUploadRequestDto, PresignUploadRequestDto } from "../dtos/file-upload.dto";
import { presignUploadRequestSchema } from "../dtos/file-upload.dto";
import { FilesService } from "../services/files.service";

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("presign")
  presignUpload(
    @Body(new ZodValidationPipe(presignUploadRequestSchema)) dto: PresignUploadRequestDto,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.filesService.presignUpload(authorizationHeader, dto);
  }

  @Put("confirm")
  confirmUpload(
    @Body() dto: ConfirmUploadRequestDto,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.filesService.confirmUpload(authorizationHeader, dto);
  }

  @Get(":id")
  getFile(
    @Param("id") fileAssetId: string,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.filesService.getFile(authorizationHeader, fileAssetId);
  }

  @Delete(":id")
  deleteFile(
    @Param("id") fileAssetId: string,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.filesService.deleteFile(authorizationHeader, fileAssetId);
  }
}