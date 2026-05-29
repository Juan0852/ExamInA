export interface CorrectionResult {
  score: number;
  isCorrect: boolean;
  summary: string;
  feedback: string;
  detectedErrors: string[];
  missingKeywords: string[];
  suggestions: string[];
  recommendedTopics: string[];
}

export interface CorrectionProvider {
  evaluateWrittenAnswer(input: {
    question: string;
    expectedAnswer: string;
    userAnswer: string;
    imageUrls?: string[];
  }): Promise<CorrectionResult>;
}
