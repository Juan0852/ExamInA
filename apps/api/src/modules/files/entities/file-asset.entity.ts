export interface FileAssetEntity {
  id: string;
  userId: string;
  bucket: string;
  key: string;
  url: string | null;
  mimeType: string;
  sizeBytes: number;
  originalFilename: string;
  fileType: "IMAGE" | "PDF" | "AUDIO" | "VIDEO" | "OTHER";
  visibility: "PRIVATE" | "PUBLIC";
  purpose: "AVATAR" | "BANNER" | "ANSWER_ATTACHMENT" | "EXAM_ATTACHMENT" | "OCR_SOURCE" | "OTHER";
  checksum: string | null;
  width: number | null;
  height: number | null;
  createdAt: Date;
  updatedAt: Date;
}