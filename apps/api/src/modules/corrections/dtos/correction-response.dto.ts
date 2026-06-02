import type { AchievementResponseDto } from "../../achievements/dtos/achievement-response.dto";

export type CorrectionResponseDto = {
  id: string;
  examSessionAnswerId: string;
  isCorrect: boolean;
  score: number;
  summary: string;
  feedback: string;
  detectedErrors: string[];
  missingKeywords: string[];
  suggestions: string[];
  recommendedTopics: string[];
  createdAt: string;
};

export type EvaluateWrittenAnswerResponseDto = {
  data: {
    answer: {
      id: string;
      questionId: string;
      examSessionId: string;
      userAnswer: string;
      score: number | null;
      isCorrect: boolean | null;
      answeredAt: string;
      createdAt: string;
    };
    correction: CorrectionResponseDto;
  };
  meta: {
    newlyUnlockedAchievements?: AchievementResponseDto[];
  };
  error: null;
};
