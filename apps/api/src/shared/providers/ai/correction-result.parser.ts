import type { CorrectionResult } from "./correction-provider.interface";

export function parseCorrectionResult(content: string): CorrectionResult {
  const parsed = parseJsonObject(extractJson(content)) as Partial<CorrectionResult>;
  const score = clampScore(Number(parsed.score ?? 0));

  return {
    score,
    isCorrect: Boolean(parsed.isCorrect ?? score >= 5),
    summary: String(parsed.summary ?? "Correccion generada."),
    feedback: String(parsed.feedback ?? "No se recibio feedback detallado."),
    detectedErrors: toStringArray(parsed.detectedErrors),
    missingKeywords: toStringArray(parsed.missingKeywords),
    suggestions: toStringArray(parsed.suggestions),
    recommendedTopics: toStringArray(parsed.recommendedTopics)
  };
}

function parseJsonObject(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return JSON.parse(escapeInvalidBackslashes(json));
  }
}

function extractJson(content: string): string {
  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || firstBrace > lastBrace) {
    throw new Error("LLM response did not contain a JSON object.");
  }

  return content.slice(firstBrace, lastBrace + 1);
}

function escapeInvalidBackslashes(json: string): string {
  return json.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
}

function clampScore(score: number): number {
  if (Number.isNaN(score)) {
    return 0;
  }

  return Math.max(0, Math.min(10, score));
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item)).filter(Boolean);
}
