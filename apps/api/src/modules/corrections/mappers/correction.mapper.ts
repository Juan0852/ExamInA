import type { EvaluateWrittenAnswerResponseDto } from "../dtos/correction-response.dto";
import type { AttemptWithCorrectionRecord } from "../repositories/corrections.repository";

export class CorrectionMapper {
  static toEvaluateWrittenAnswerResponse(
    attempt: AttemptWithCorrectionRecord
  ): EvaluateWrittenAnswerResponseDto {
    return {
      data: {
        attempt: {
          id: attempt.id,
          questionId: attempt.questionId,
          examSessionId: attempt.examSessionId,
          userAnswer: attempt.userAnswer,
          score: attempt.score,
          status: attempt.status,
          createdAt: attempt.createdAt.toISOString(),
          updatedAt: attempt.updatedAt.toISOString()
        },
        correction: {
          id: attempt.correction.id,
          attemptId: attempt.correction.attemptId,
          isCorrect: attempt.correction.isCorrect,
          score: attempt.correction.score,
          summary: attempt.correction.summary,
          feedback: attempt.correction.feedback,
          detectedErrors: CorrectionMapper.toStringArray(attempt.correction.detectedErrors),
          missingKeywords: CorrectionMapper.toStringArray(attempt.correction.missingKeywords),
          suggestions: CorrectionMapper.toStringArray(attempt.correction.suggestions),
          recommendedTopics: CorrectionMapper.toStringArray(attempt.correction.recommendedTopics),
          createdAt: attempt.correction.createdAt.toISOString()
        }
      },
      meta: {},
      error: null
    };
  }

  private static toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.map((item) => String(item)).filter(Boolean);
  }
}
