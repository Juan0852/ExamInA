import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { FindQuestionsQueryDto } from "../dtos/find-questions-query.dto";
import { QuestionMapper } from "../mappers/question.mapper";
import type { QuestionsRepository } from "../repositories/questions.repository";

export const QUESTIONS_REPOSITORY = Symbol("QUESTIONS_REPOSITORY");

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(QUESTIONS_REPOSITORY) private readonly questionsRepository: QuestionsRepository
  ) {}

  async findAll(filters: FindQuestionsQueryDto) {
    const questions = await this.questionsRepository.findAll(filters);

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
