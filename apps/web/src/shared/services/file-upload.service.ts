import { apiService } from "./api.service";

export interface PresignUploadRequest {
  fileName: string;
  contentType: string;
  purpose: "AVATAR" | "BANNER" | "ATTEMPT_ATTACHMENT" | "QUESTION_ATTACHMENT" | "OCR_SOURCE" | "OTHER";
  visibility: "PUBLIC" | "PRIVATE";
}

export interface PresignUploadResponse {
  data: {
    uploadUrl: string;
    key: string;
    bucket: string;
    fileAssetId: string;
  };
  meta: Record<string, unknown>;
  error: string | null;
}

export interface ConfirmUploadRequest {
  fileAssetId: string;
  width?: number;
  height?: number;
}

export interface FileAssetResponse {
  data: {
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
  };
  meta: Record<string, unknown>;
  error: string | null;
}

export interface UploadedImage {
  fileAssetId: string;
  url: string;
  key: string;
}

export const fileUploadService = {
  async presignUpload(request: PresignUploadRequest): Promise<PresignUploadResponse> {
    return apiService.post<PresignUploadResponse>("/files/presign", request);
  },

  async uploadToPresignedUrl(uploadUrl: string, file: File | Blob): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type
      }
    });

    if (!response.ok) {
      let errorMessage = `S3 Upload Failed: ${response.status} ${response.statusText}`;
      try {
        const text = await response.text();
        errorMessage += ` - ${text}`;
      } catch (e) {
        // ignore
      }
      throw new Error(errorMessage);
    }
  },

  async confirmUpload(request: ConfirmUploadRequest): Promise<FileAssetResponse> {
    return apiService.put<FileAssetResponse>("/files/confirm", request);
  },

  async getFile(fileAssetId: string): Promise<FileAssetResponse> {
    return apiService.get<FileAssetResponse>(`/files/${fileAssetId}`);
  },

  async deleteFile(fileAssetId: string): Promise<void> {
    await apiService.delete(`/files/${fileAssetId}`);
  },

  async uploadImage(file: File, purpose: PresignUploadRequest["purpose"]): Promise<UploadedImage> {
    const presignResponse = await this.presignUpload({
      fileName: file.name,
      contentType: file.type,
      purpose,
      visibility: "PUBLIC"
    });

    if (presignResponse.error) {
      throw new Error(presignResponse.error);
    }

    const { uploadUrl, fileAssetId } = presignResponse.data;

    await this.uploadToPresignedUrl(uploadUrl, file);

    const confirmResponse = await this.confirmUpload({ fileAssetId });

    if (confirmResponse.error) {
      throw new Error(confirmResponse.error);
    }

    return {
      fileAssetId,
      url: confirmResponse.data.url ?? "",
      key: presignResponse.data.key
    };
  }
};