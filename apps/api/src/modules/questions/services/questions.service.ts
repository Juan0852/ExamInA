import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { FindQuestionsQueryDto } from "../dtos/find-questions-query.dto";
import { QuestionMapper } from "../mappers/question.mapper";
import type { QuestionsRepository } from "../repositories/questions.repository";
import { AuthService } from "../../auth/services/auth.service";

export const QUESTIONS_REPOSITORY = Symbol("QUESTIONS_REPOSITORY");

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(QUESTIONS_REPOSITORY) private readonly questionsRepository: QuestionsRepository
  ) {}

  async findAll(authorizationHeader: string | undefined, filters: FindQuestionsQueryDto) {
    let userId: string | undefined;
    if (authorizationHeader) {
      try {
        const user = await this.authService.resolveAuthenticatedUser(authorizationHeader);
        userId = user.id;
      } catch {
        // Ignore token errors and return anonymous listing
      }
    }
    const questions = await this.questionsRepository.findAll(filters, userId);

    return {
      data: questions.map(QuestionMapper.toResponse),
      meta: {
        total: questions.length
      },
      error: null
    };
  }

  async findById(id: string) {
    const question = await this.questionsRepository.findById(id);

    if (!question) {
      throw new NotFoundException("Question was not found.");
    }

    return {
      data: QuestionMapper.toResponse(question),
      meta: {},
      error: null
    };
  }
}
