import type { QuestionResponseDto } from "../dtos/question-response.dto";
import type { QuestionEntity } from "../entities/question.entity";

export class QuestionMapper {
  static toResponse(question: QuestionEntity): QuestionResponseDto {
    return {
      id: question.id,
      subjectId: question.subjectId,
      topicId: question.topicId,
      statement: question.statement,
      type: question.type,
      difficulty: question.difficulty,
      sourceYear: question.sourceYear,
      sourceExam: question.sourceExam,
      createdAt: question.createdAt.toISOString(),
      updatedAt: question.updatedAt.toISOString(),
      subject: question.subject
        ? {
            id: question.subject.id,
            name: question.subject.name,
            slug: question.subject.slug
          }
        : undefined,
      topic: question.topic
        ? {
            id: question.topic.id,
            name: question.topic.name,
            slug: question.topic.slug
          }
        : undefined,
      solution: question.solution
        ? {
            id: question.solution.id,
            finalAnswer: question.solution.finalAnswer,
            explanation: question.solution.explanation,
            gradingCriteria: question.solution.gradingCriteria
          }
        : question.solution,
      keywords: question.keywords?.map((keyword) => keyword.keyword)
    };
  }
}
