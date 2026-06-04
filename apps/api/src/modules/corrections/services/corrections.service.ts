import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuthService } from "../../auth/services/auth.service";
import type { CorrectionProvider } from "../../../shared/providers/ai/correction-provider.interface";
import type { EvaluateWrittenAnswerRequestDto } from "../dtos/evaluate-written-answer-request.dto";
import type { EvaluateWrittenAnswerResponseDto } from "../dtos/correction-response.dto";
import { CorrectionMapper } from "../mappers/correction.mapper";
import type { CorrectionsRepository } from "../repositories/corrections.repository";
import { AchievementsService } from "../../achievements/services/achievements.service";
import { AiProviderException } from "../../../shared/errors/ai-provider.exception";

import type { FilesRepository } from "../../files/repositories/files.repository";
import { FILES_REPOSITORY } from "../../files/services/files.service.constants";

export const CORRECTION_PROVIDER = Symbol("CORRECTION_PROVIDER");
export const CORRECTIONS_REPOSITORY = Symbol("CORRECTIONS_REPOSITORY");

@Injectable()
export class CorrectionsService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(CORRECTION_PROVIDER) private readonly correctionProvider: CorrectionProvider,
    @Inject(CORRECTIONS_REPOSITORY) private readonly correctionsRepository: CorrectionsRepository,
    @Inject(FILES_REPOSITORY) private readonly filesRepository: FilesRepository,
    @Inject(AchievementsService) private readonly achievementsService: AchievementsService
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

    const sessionQuestion = await this.correctionsRepository.findSessionQuestionForUser({
      userId: user.id,
      examSessionId: data.examSessionId,
      questionId: data.questionId
    });

    if (!sessionQuestion) {
      throw new NotFoundException("Question not found in this exam session.");
    }

    const existingAnswer = await this.correctionsRepository.findAnswerForSessionQuestion({
      examSessionId: data.examSessionId,
      questionId: data.questionId
    });

    if (existingAnswer) {
      throw new ConflictException("This question has already been evaluated.");
    }

    let imageUrls: string[] = [];
    try {
      if (data.attachmentIds && data.attachmentIds.length > 0) {
        const attachments = await this.filesRepository.findManyByIds(data.attachmentIds);
        imageUrls = attachments.filter((att) => att.url !== null).map((att) => att.url as string);
      }

      const expectedAnswer = this.buildExpectedAnswer(
        question.solution?.finalAnswer,
        question.solution?.explanation,
        question.solution?.expectedKeywords
      );
      const correction = await this.correctionProvider.evaluateWrittenAnswer({
        question: question.statement,
        expectedAnswer,
        userAnswer: data.userAnswer,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined
      });
      const answer = await this.correctionsRepository.createAnswerWithCorrection({
        userId: user.id,
        questionId: data.questionId,
        examSessionId: data.examSessionId,
        userAnswer: data.userAnswer,
        correction,
        timeSpentSeconds: data.timeSpentSeconds,
        subjectId: question.subjectId,
        topicId: question.topicId
      });

      const newlyUnlockedAchievements = await this.achievementsService.evaluateForUser(user.id);

      const response = CorrectionMapper.toEvaluateWrittenAnswerResponse(answer);
      return {
        ...response,
        meta: {
          newlyUnlockedAchievements
        }
      };
    } catch (e: any) {
      throw new AiProviderException("AI Eval Failed");
    }
  }

  private buildExpectedAnswer(finalAnswer?: string, explanation?: string, expectedKeywords: string[] = []): string {
    const keywordsBlock = expectedKeywords.length > 0
      ? `Palabras clave esperadas: ${expectedKeywords.join(", ")}`
      : undefined;

    return [finalAnswer, explanation, keywordsBlock].filter(Boolean).join("\n\n");
  }
}
