import { z } from "zod";

export const presignUploadRequestSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(100),
  purpose: z.enum([
    "AVATAR",
    "BANNER",
    "ATTEMPT_ATTACHMENT",
    "EXAM_ATTACHMENT",
    "OCR_SOURCE",
    "OTHER"
  ]),
  visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC")
});

export type PresignUploadRequestDto = z.infer<typeof presignUploadRequestSchema>;

export interface PresignUploadResponseDto {
  uploadUrl: string;
  key: string;
  bucket: string;
  fileAssetId: string;
}

export interface ConfirmUploadRequestDto {
  fileAssetId: string;
  width?: number;
  height?: number;
}

export interface FileAssetResponseDto {
  id: string;
  url: string | null;
  key: string;
  bucket: string;
  mimeType: string;
  sizeBytes: number;
  originalFilename: string;
  fileType: string;
  visibility: string;
  purpose: string;
  width: number | null;
  height: number | null;
  createdAt: string;
}