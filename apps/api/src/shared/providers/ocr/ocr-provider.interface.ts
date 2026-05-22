export interface OcrProvider {
  extractText(input: { fileId: string }): Promise<{ text: string }>;
}
