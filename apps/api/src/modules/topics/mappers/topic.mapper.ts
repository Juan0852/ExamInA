import type { TopicResponseDto } from "../dtos/topic-response.dto";
import type { TopicEntity } from "../entities/topic.entity";

export class TopicMapper {
  static toResponse(topic: TopicEntity): TopicResponseDto {
    return {
      id: topic.id,
      subjectId: topic.subjectId,
      name: topic.name,
      slug: topic.slug,
      questionsCount: topic._count?.questions ?? 0,
      createdAt: topic.createdAt.toISOString(),
      subject: topic.subject
        ? {
            id: topic.subject.id,
            name: topic.subject.name,
            slug: topic.subject.slug
          }
        : undefined
    };
  }
}
