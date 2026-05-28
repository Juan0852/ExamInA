export type LlmProviderName = "mock" | "openai" | "lmstudio" | "local" | "gemma4";

export type LlmProviderConfig = {
  provider: LlmProviderName;
  baseUrl: string;
  model: string;
  apiKey?: string;
};

const DEFAULT_LOCAL_BASE_URL = "http://localhost:1234/v1";
const DEFAULT_LOCAL_MODEL = "gemma-3-4b-it";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";

export function getLlmProviderConfig(): LlmProviderConfig {
  const provider = normalizeProvider(process.env.LLM_PROVIDER);

  if (provider === "openai") {
    return {
      provider,
      baseUrl: (process.env.LLM_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/$/, ""),
      model: process.env.LLM_MODEL || process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      apiKey: process.env.LLM_API_KEY || process.env.OPENAI_API_KEY
    };
  }

  if (provider === "lmstudio" || provider === "local" || provider === "gemma4") {
    return {
      provider,
      baseUrl: (process.env.LLM_BASE_URL || process.env.LOCAL_LLM_BASE_URL || DEFAULT_LOCAL_BASE_URL).replace(/\/$/, ""),
      model: process.env.LLM_MODEL || process.env.LMSTUDIO_MODEL || DEFAULT_LOCAL_MODEL,
      apiKey: process.env.LLM_API_KEY
    };
  }

  return {
    provider: "mock",
    baseUrl: "",
    model: "mock"
  };
}

function normalizeProvider(value?: string): LlmProviderName {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "openai" ||
    normalized === "lmstudio" ||
    normalized === "local" ||
    normalized === "gemma4"
  ) {
    return normalized;
  }

  return "mock";
}
