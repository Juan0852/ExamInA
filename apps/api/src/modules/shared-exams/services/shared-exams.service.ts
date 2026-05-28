import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AuthService } from "../../auth/services/auth.service";
import type { SharedExamsResponseDto, StartSharedExamResponseDto } from "../dtos/shared-exam-response.dto";
import { SharedExamMapper } from "../mappers/shared-exam.mapper";
import type { SharedExamsRepository } from "../repositories/shared-exams.repository";

export const SHARED_EXAMS_REPOSITORY = Symbol("SHARED_EXAMS_REPOSITORY");

@Injectable()
export class SharedExamsService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(SHARED_EXAMS_REPOSITORY) private readonly sharedExamsRepository: SharedExamsRepository
  ) {}

  async findPublished(input?: { subjectId?: string }): Promise<SharedExamsResponseDto> {
    const sharedExams = await this.sharedExamsRepository.findPublished(input);

    return {
      data: sharedExams.map(SharedExamMapper.toSummaryResponse),
      meta: {
        total: sharedExams.length
      },
      error: null
    };
  }

  async start(
    sharedExamId: string,
    authorizationHeader?: string
  ): Promise<StartSharedExamResponseDto> {
    const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
    const sharedExam = await this.sharedExamsRepository.findPublishedById(sharedExamId);

    if (!sharedExam) {
      throw new NotFoundException("Shared exam not found.");
    }

    const result = await this.sharedExamsRepository.startForUser({
      sharedExam,
      userId: user.id
    });

    return {
      data: result,
      meta: {},
      error: null
    };
  }
}
