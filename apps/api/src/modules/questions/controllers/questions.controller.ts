import { Controller, Get, Inject, Param, Query, Headers, Post, Body } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import {
  findQuestionsQuerySchema,
  type FindQuestionsQueryDto
} from "../dtos/find-questions-query.dto";
import { QuestionsService } from "../services/questions.service";

@Controller("questions")
export class QuestionsController {
  constructor(@Inject(QuestionsService) private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Query(new ZodValidationPipe(findQuestionsQuerySchema)) query: FindQuestionsQueryDto
  ) {
    return this.questionsService.findAll(authorizationHeader, query);
  }

  @Post("generate-ai")
  generateAi(
    @Body() body: { prompt: string; subjectId?: string; topicId?: string; difficulty?: string; fileAssetId?: string },
    @Headers("authorization") authorizationHeader: string | undefined
  ) {
    return this.questionsService.generateAi(body, authorizationHeader);
  }

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.questionsService.findById(id);
  }
}
