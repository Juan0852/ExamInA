import type { CorrectionProvider, CorrectionResult } from "./correction-provider.interface";

export class OpenAICorrectionProvider implements CorrectionProvider {
  async evaluateWrittenAnswer(): Promise<CorrectionResult> {
    throw new Error("OpenAICorrectionProvider is not configured yet.");
  }
}
