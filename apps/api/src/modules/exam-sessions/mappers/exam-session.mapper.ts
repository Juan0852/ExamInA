import type { ExamSessionEnvelopeDto, ExamSessionResponseDto } from "../dtos/exam-session-response.dto";
import type { ExamSessionRecord } from "../repositories/exam-sessions.repository";

export class ExamSessionMapper {
  static toEnvelope(examSession: ExamSessionRecord): ExamSessionEnvelopeDto {
    const answerMap = new Map(
      examSession.answers.map((a) => [a.questionId, a])
    );

    return {
      data: {
        id: examSession.id,
        title: examSession.title,
        mode: examSession.mode,
        status: examSession.status,
        durationLimitSeconds: examSession.durationLimitSeconds,
        startedAt: examSession.startedAt?.toISOString() ?? null,
        finishedAt: examSession.finishedAt?.toISOString() ?? null,
        lastActivityAt: examSession.lastActivityAt?.toISOString() ?? null,
        totalTimeSeconds: examSession.totalTimeSeconds,
        questions: examSession.questions.map((sessionQuestion) => {
          const answer = answerMap.get(sessionQuestion.questionId);

          return {
            id: sessionQuestion.id,
            questionId: sessionQuestion.questionId,
            order: sessionQuestion.sortOrder,
            statement: sessionQuestion.question.statement,
            type: sessionQuestion.question.type,
            difficulty: sessionQuestion.question.difficulty,
            sourceYear: sessionQuestion.question.sourceYear,
            sourceExam: sessionQuestion.question.sourceExam,
            answered: answer != null,
            userAnswer: answer?.userAnswer ?? null,
            score: answer?.score ?? null,
            isCorrect: answer?.isCorrect ?? null,
            correction: answer?.correction
              ? {
                  feedback: answer.correction.feedback,
                  detectedErrors: answer.correction.detectedErrors,
                  missingKeywords: answer.correction.missingKeywords,
                  suggestions: answer.correction.suggestions
                }
              : null
          };
        })
      },
      meta: {},
      error: null
    };
  }
}
