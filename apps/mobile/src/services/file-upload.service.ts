import { apiService } from "./api.service";

type UploadPurpose = "AVATAR" | "BANNER" | "ANSWER_ATTACHMENT" | "EXAM_ATTACHMENT" | "OCR_SOURCE" | "OTHER";
type UploadVisibility = "PUBLIC" | "PRIVATE";

interface PresignUploadResponse {
  data: {
    uploadUrl: string;
    key: string;
    bucket: string;
    fileAssetId: string;
  };
  meta: Record<string, unknown>;
  error: string | null;
}

interface FileAssetResponse {
  data: {
    id: string;
    url: string | null;
    key: string;
  };
  meta: Record<string, unknown>;
  error: string | null;
}

export interface UploadLocalImageInput {
  uri: string;
  fileName: string;
  contentType: string;
  purpose: UploadPurpose;
  visibility: UploadVisibility;
  width?: number;
  height?: number;
}

export interface UploadedImage {
  fileAssetId: string;
  url: string;
  key: string;
}

export const fileUploadService = {
  async uploadLocalImage(input: UploadLocalImageInput): Promise<UploadedImage> {
    const presignResponse = await apiService.post<PresignUploadResponse>("/files/presign", {
      fileName: input.fileName,
      contentType: input.contentType,
      purpose: input.purpose,
      visibility: input.visibility,
    });

    if (presignResponse.error) {
      throw new Error(presignResponse.error);
    }

    const fileResponse = await fetch(input.uri);
    const blob = await fileResponse.blob();

    const uploadResponse = await fetch(presignResponse.data.uploadUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": input.contentType,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error(`No se pudo subir la imagen (${uploadResponse.status}).`);
    }

    const confirmResponse = await apiService.put<FileAssetResponse>("/files/confirm", {
      fileAssetId: presignResponse.data.fileAssetId,
      width: input.width,
      height: input.height,
    });

    if (confirmResponse.error) {
      throw new Error(confirmResponse.error);
    }

    return {
      fileAssetId: presignResponse.data.fileAssetId,
      url: confirmResponse.data.url ?? "",
      key: presignResponse.data.key,
    };
  },
};

