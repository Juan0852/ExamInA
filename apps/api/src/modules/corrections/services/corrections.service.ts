import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuthService } from "../../auth/services/auth.service";
import type { CorrectionProvider } from "../../../shared/providers/ai/correction-provider.interface";
import type { EvaluateWrittenAnswerRequestDto } from "../dtos/evaluate-written-answer-request.dto";
import type { EvaluateWrittenAnswerResponseDto } from "../dtos/correction-response.dto";
import type { ResetAttemptsRequestDto } from "../dtos/reset-attempts-request.dto";
import { CorrectionMapper } from "../mappers/correction.mapper";
import type { CorrectionsRepository } from "../repositories/corrections.repository";

export const CORRECTION_PROVIDER = Symbol("CORRECTION_PROVIDER");
export const CORRECTIONS_REPOSITORY = Symbol("CORRECTIONS_REPOSITORY");

@Injectable()
export class CorrectionsService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(CORRECTION_PROVIDER) private readonly correctionProvider: CorrectionProvider,
    @Inject(CORRECTIONS_REPOSITORY) private readonly correctionsRepository: CorrectionsRepository
  ) {}

  async evaluateWrittenAnswer(
    authorizationHeader: string | undefined,
    data: EvaluateWrittenAnswerRequestDto
  ): Promise<EvaluateWrittenAnswerResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const question = await this.correctionsRepository.findQuestionForCorrection(data.questionId);

    if (!question) {
      throw new NotFoundException("Question not found.");
    }

    const expectedAnswer = this.buildExpectedAnswer(question.solution?.finalAnswer, question.solution?.explanation);
    const correction = await this.correctionProvider.evaluateWrittenAnswer({
      question: question.statement,
      expectedAnswer,
      userAnswer: data.userAnswer
    });
    const attempt = await this.correctionsRepository.createAttemptWithCorrection({
      userId: user.id,
      questionId: data.questionId,
      examSessionId: data.examSessionId,
      userAnswer: data.userAnswer,
      correction,
      timeSpentSeconds: data.timeSpentSeconds,
      subjectId: question.subjectId,
      topicId: question.topicId
    });

    return CorrectionMapper.toEvaluateWrittenAnswerResponse(attempt);
  }

  private buildExpectedAnswer(finalAnswer?: string, explanation?: string): string {
    return [finalAnswer, explanation].filter(Boolean).join("\n\n");
  }

  async resetAttempts(
    authorizationHeader: string | undefined,
    data: ResetAttemptsRequestDto
  ): Promise<{ success: boolean }> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    await this.correctionsRepository.resetAttempts(user.id, data.questionIds);
    return { success: true };
  }
}
