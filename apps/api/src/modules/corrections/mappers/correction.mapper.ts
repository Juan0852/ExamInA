import type { EvaluateWrittenAnswerResponseDto } from "../dtos/correction-response.dto";
import type { ExamSessionAnswerWithCorrectionRecord } from "../repositories/corrections.repository";

export class CorrectionMapper {
  static toEvaluateWrittenAnswerResponse(
    answer: ExamSessionAnswerWithCorrectionRecord
  ): EvaluateWrittenAnswerResponseDto {
    return {
      data: {
        answer: {
          id: answer.id,
          questionId: answer.questionId,
          examSessionId: answer.examSessionId,
          userAnswer: answer.userAnswer,
          score: answer.score,
          isCorrect: answer.isCorrect,
          answeredAt: (answer.answeredAt ?? answer.createdAt).toISOString(),
          createdAt: answer.createdAt.toISOString()
        },
        correction: {
          id: answer.correction.id,
          examSessionAnswerId: answer.id,
          isCorrect: answer.correction.isCorrect,
          score: answer.correction.score,
          summary: answer.correction.summary,
          feedback: answer.correction.feedback,
          detectedErrors: CorrectionMapper.toStringArray(answer.correction.detectedErrors),
          missingKeywords: CorrectionMapper.toStringArray(answer.correction.missingKeywords),
          suggestions: CorrectionMapper.toStringArray(answer.correction.suggestions),
          recommendedTopics: CorrectionMapper.toStringArray(answer.correction.recommendedTopics),
          createdAt: answer.correction.createdAt.toISOString()
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
