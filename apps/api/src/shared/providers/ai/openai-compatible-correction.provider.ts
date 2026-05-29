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
    imageUrls?: string[];
  }): Promise<CorrectionResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
    }

    let imageUrls = input.imageUrls;

    if (
      imageUrls &&
      imageUrls.length > 0 &&
      (this.config.provider === "lmstudio" ||
        this.config.provider === "local" ||
        this.config.provider === "gemma4")
    ) {
      imageUrls = await Promise.all(
        imageUrls.map(async (url) => {
          if (url.startsWith("data:")) {
            return url;
          }
          try {
            const res = await fetch(url);
            if (!res.ok) {
              throw new Error(`Failed to fetch image: ${res.statusText}`);
            }
            const buffer = await res.arrayBuffer();
            const base64 = Buffer.from(buffer).toString("base64");
            const contentType = res.headers.get("content-type") || "image/jpeg";
            return `data:${contentType};base64,${base64}`;
          } catch (err) {
            console.error(`Error converting image URL to base64: ${url}`, err);
            return url; // fallback
          }
        })
      );
    }

    const body: Record<string, unknown> = {
      model: this.config.model,
      temperature: 0.2,
      messages: buildWrittenAnswerCorrectionMessages({
        ...input,
        imageUrls
      })
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
