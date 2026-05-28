import { buildWrittenAnswerCorrectionMessages } from "./correction-prompt.builder";
import type { CorrectionProvider, CorrectionResult } from "./correction-provider.interface";
import { parseCorrectionResult } from "./correction-result.parser";
import type { LlmProviderConfig } from "./llm-provider.config";

type ChatCompletionsResponse = {
  choices?: {
    message?: {
      content?: string;
    };
  }[];
};

export class OpenAiCompatibleCorrectionProvider implements CorrectionProvider {
  constructor(private readonly config: LlmProviderConfig) {}

  async evaluateWrittenAnswer(input: {
    question: string;
    expectedAnswer: string;
    userAnswer: string;
  }): Promise<CorrectionResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }

    const body: Record<string, unknown> = {
      model: this.config.model,
      temperature: 0.2,
      messages: buildWrittenAnswerCorrectionMessages(input)
    };

    if (this.config.provider === "openai") {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `${this.config.provider} correction failed with status ${response.status}: ${errorBody}`
      );
    }

    const payload = (await response.json()) as ChatCompletionsResponse;
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error(`${this.config.provider} returned an empty correction response.`);
    }

    return parseCorrectionResult(content);
  }
}
