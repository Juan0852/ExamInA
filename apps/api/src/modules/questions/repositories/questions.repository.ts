import type { FindQuestionsQueryDto } from "../dtos/find-questions-query.dto";
import type { QuestionEntity } from "../entities/question.entity";

export interface QuestionsRepository {
  findAll(filters: FindQuestionsQueryDto): Promise<QuestionEntity[]>;
  findById(id: string): Promise<QuestionEntity | null>;
}
