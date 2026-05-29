import type { CorrectionProvider, CorrectionResult } from "./correction-provider.interface";

export class MockCorrectionProvider implements CorrectionProvider {
  async evaluateWrittenAnswer(input: {
    question: string;
    expectedAnswer: string;
    userAnswer: string;
    imageUrls?: string[];
  }): Promise<CorrectionResult> {
    return {
      score: 0,
      isCorrect: false,
      summary: "Mock correction pending real rules.",
      feedback: "Correction feedback will be implemented in the academic flow.",
      detectedErrors: [],
      missingKeywords: [],
      suggestions: [],
      recommendedTopics: []
    };
  }
}
