import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuthService } from "../../auth/services/auth.service";
import type { CreateExamSessionRequestDto } from "../dtos/create-exam-session-request.dto";
import type { ExamSessionEnvelopeDto, ExamSessionResponseDto } from "../dtos/exam-session-response.dto";
import type { SyncExamSessionActivityRequestDto } from "../dtos/sync-exam-session-activity-request.dto";
import { ExamSessionMapper } from "../mappers/exam-session.mapper";
import type { ExamSessionsRepository } from "../repositories/exam-sessions.repository";

export const EXAM_SESSIONS_REPOSITORY = Symbol("EXAM_SESSIONS_REPOSITORY");

@Injectable()
export class ExamSessionsService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(EXAM_SESSIONS_REPOSITORY)
    private readonly examSessionsRepository: ExamSessionsRepository
  ) {}

  async findById(
    examSessionId: string,
    authorizationHeader?: string
  ): Promise<ExamSessionEnvelopeDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const examSession = await this.examSessionsRepository.findByIdForUser(examSessionId, user.id);

    if (!examSession) {
      throw new NotFoundException("Exam session not found.");
    }

    return ExamSessionMapper.toEnvelope(examSession);
  }

  async create(
    authorizationHeader: string | undefined,
    data: CreateExamSessionRequestDto
  ): Promise<ExamSessionEnvelopeDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const examSession = await this.examSessionsRepository.create({
      userId: user.id,
      title: data.title,
      questionIds: data.questionIds,
      timerEnabled: data.timerEnabled,
      durationLimitSeconds: data.durationLimitSeconds
    });

    return ExamSessionMapper.toEnvelope(examSession);
  }

  async findAllForUser(authorizationHeader?: string): Promise<{ data: ExamSessionResponseDto[]; meta: {}; error: null }> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const sessions = await this.examSessionsRepository.findAllForUser(user.id);

    return {
      data: sessions.map((session) => ExamSessionMapper.toEnvelope(session).data),
      meta: {},
      error: null
    };
  }

  async finish(
    examSessionId: string,
    authorizationHeader: string | undefined,
    totalTimeSeconds: number
  ): Promise<ExamSessionEnvelopeDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const syncedActivity = await this.examSessionsRepository.syncActivity({
      examSessionId,
      userId: user.id,
      elapsedSeconds: totalTimeSeconds
    });
    const examSession = await this.examSessionsRepository.finish(
      examSessionId,
      user.id,
      syncedActivity.totalTimeSeconds
    );

    return ExamSessionMapper.toEnvelope(examSession);
  }

  async syncActivity(
    examSessionId: string,
    authorizationHeader: string | undefined,
    body: SyncExamSessionActivityRequestDto
  ): Promise<{
    data: {
      totalTimeSeconds: number;
      recordedDeltaSeconds: number;
    };
    meta: {};
    error: null;
  }> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const result = await this.examSessionsRepository.syncActivity({
      examSessionId,
      userId: user.id,
      elapsedSeconds: body.elapsedSeconds
    });

    return {
      data: result,
      meta: {},
      error: null
    };
  }

  async delete(
    examSessionId: string,
    authorizationHeader: string | undefined
  ): Promise<{ data: { deleted: boolean }; meta: {}; error: null }> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const deleted = await this.examSessionsRepository.deleteForUser(examSessionId, user.id);

    if (!deleted) {
      throw new NotFoundException("Exam session not found.");
    }

    return {
      data: { deleted },
      meta: {},
      error: null
    };
  }
}
