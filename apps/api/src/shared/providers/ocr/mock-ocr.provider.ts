import type { OcrProvider } from "./ocr-provider.interface";

export class MockOcrProvider implements OcrProvider {
  async extractText(): Promise<{ text: string }> {
    return { text: "" };
  }
}
