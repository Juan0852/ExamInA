import { Inject, Injectable } from "@nestjs/common";
import type { FindTopicsQueryDto } from "../dtos/find-topics-query.dto";
import { TopicMapper } from "../mappers/topic.mapper";
import type { TopicsRepository } from "../repositories/topics.repository";

export const TOPICS_REPOSITORY = Symbol("TOPICS_REPOSITORY");

@Injectable()
export class TopicsService {
  constructor(@Inject(TOPICS_REPOSITORY) private readonly topicsRepository: TopicsRepository) {}

  async findAll(filters: FindTopicsQueryDto = {}) {
    const topics = await this.topicsRepository.findAll(filters);

    return {
      data: topics.map(TopicMapper.toResponse),
      meta: {
        total: topics.length
      },
      error: null
    };
  }
}
