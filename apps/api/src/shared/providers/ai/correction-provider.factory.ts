import { MockCorrectionProvider } from "./mock-correction.provider";
import type { CorrectionProvider } from "./correction-provider.interface";
import { getLlmProviderConfig } from "./llm-provider.config";
import { OpenAiCompatibleCorrectionProvider } from "./openai-compatible-correction.provider";

export function createCorrectionProvider(): CorrectionProvider {
  const config = getLlmProviderConfig();

  if (config.provider === "mock") {
    return new MockCorrectionProvider();
  }

  return new OpenAiCompatibleCorrectionProvider(config);
}
