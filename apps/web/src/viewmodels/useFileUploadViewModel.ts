import { useState, useCallback } from "react";
import { fileUploadService, type PresignUploadRequest, type UploadedImage } from "../shared/services/file-upload.service";

interface UseFileUploadOptions {
  purpose: PresignUploadRequest["purpose"];
  visibility?: "PUBLIC" | "PRIVATE";
  onSuccess?: (result: UploadedImage) => void;
  onError?: (error: Error) => void;
}

interface UseFileUploadReturn {
  upload: (file: File) => Promise<UploadedImage | null>;
  uploadMultiple: (files: File[]) => Promise<UploadedImage[]>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  reset: () => void;
}

export function useFileUpload(options: UseFileUploadOptions): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setIsUploading(false);
    setProgress(0);
    setError(null);
  }, []);

  const upload = useCallback(
    async (file: File): Promise<UploadedImage | null> => {
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        setProgress(10);

        const presignResponse = await fileUploadService.presignUpload({
          fileName: file.name,
          contentType: file.type,
          purpose: options.purpose,
          visibility: options.visibility ?? "PUBLIC"
        });

        if (presignResponse.error) {
          throw new Error(presignResponse.error);
        }

        setProgress(30);

        const { uploadUrl, fileAssetId } = presignResponse.data;

        await fileUploadService.uploadToPresignedUrl(uploadUrl, file);

        setProgress(80);

        const confirmResponse = await fileUploadService.confirmUpload({
          fileAssetId
        });

        if (confirmResponse.error) {
          throw new Error(confirmResponse.error);
        }

        setProgress(100);

        const result: UploadedImage = {
          fileAssetId,
          url: confirmResponse.data.url ?? "",
          key: presignResponse.data.key
        };

        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error al subir archivo";
        setError(message);
        options.onError?.(err instanceof Error ? err : new Error(message));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options.purpose, options.visibility, options.onSuccess, options.onError]
  );

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadedImage[]> => {
      const results: UploadedImage[] = [];
      for (const file of files) {
        const result = await upload(file);
        if (result) {
          results.push(result);
        }
      }
      return results;
    },
    [upload]
  );

  return { upload, uploadMultiple, isUploading, progress, error, reset };
}