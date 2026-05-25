import type { SubjectResponseDto } from "../dtos/subject-response.dto";
import type { SubjectEntity } from "../entities/subject.entity";

export class SubjectMapper {
  static toResponse(subject: SubjectEntity): SubjectResponseDto {
    return {
      id: subject.id,
      name: subject.name,
      slug: subject.slug,
      description: subject.description,
      topicsCount: subject._count?.topics ?? 0,
      questionsCount: subject._count?.questions ?? 0,
      createdAt: subject.createdAt.toISOString()
    };
  }
}
