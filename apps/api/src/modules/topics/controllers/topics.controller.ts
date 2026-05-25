import { Controller, Get, Inject, Query } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import { findTopicsQuerySchema, type FindTopicsQueryDto } from "../dtos/find-topics-query.dto";
import { TopicsService } from "../services/topics.service";

@Controller("topics")
export class TopicsController {
  constructor(@Inject(TopicsService) private readonly topicsService: TopicsService) {}

  @Get()
  findAll(@Query(new ZodValidationPipe(findTopicsQuerySchema)) query: FindTopicsQueryDto) {
    return this.topicsService.findAll(query);
  }
}
