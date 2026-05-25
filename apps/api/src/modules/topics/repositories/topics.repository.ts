import type { FindTopicsQueryDto } from "../dtos/find-topics-query.dto";
import type { TopicEntity } from "../entities/topic.entity";

export interface TopicsRepository {
  findAll(filters: FindTopicsQueryDto): Promise<TopicEntity[]>;
}
