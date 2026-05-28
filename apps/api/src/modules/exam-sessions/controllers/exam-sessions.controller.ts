import { Body, Controller, Delete, Get, Headers, Inject, Param, Patch, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import {
  createExamSessionRequestSchema,
  type CreateExamSessionRequestDto
} from "../dtos/create-exam-session-request.dto";
import {
  syncExamSessionActivityRequestSchema,
  type SyncExamSessionActivityRequestDto
} from "../dtos/sync-exam-session-activity-request.dto";
import { ExamSessionsService } from "../services/exam-sessions.service";

@Controller("exam-sessions")
export class ExamSessionsController {
  constructor(@Inject(ExamSessionsService) private readonly examSessionsService: ExamSessionsService) {}

  @Get("me")
  findAllForUser(@Headers("authorization") authorizationHeader?: string) {
    return this.examSessionsService.findAllForUser(authorizationHeader);
  }

  @Get(":examSessionId")
  findById(
    @Param("examSessionId") examSessionId: string,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.examSessionsService.findById(examSessionId, authorizationHeader);
  }

  @Post()
  create(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body(new ZodValidationPipe(createExamSessionRequestSchema))
    data: CreateExamSessionRequestDto
  ) {
    return this.examSessionsService.create(authorizationHeader, data);
  }

  @Patch(":examSessionId/finish")
  finish(
    @Param("examSessionId") examSessionId: string,
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body() body: { totalTimeSeconds: number }
  ) {
    return this.examSessionsService.finish(examSessionId, authorizationHeader, body.totalTimeSeconds ?? 0);
  }

  @Patch(":examSessionId/activity")
  syncActivity(
    @Param("examSessionId") examSessionId: string,
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body(new ZodValidationPipe(syncExamSessionActivityRequestSchema))
    body: SyncExamSessionActivityRequestDto
  ) {
    return this.examSessionsService.syncActivity(examSessionId, authorizationHeader, body);
  }

  @Delete(":examSessionId")
  delete(
    @Param("examSessionId") examSessionId: string,
    @Headers("authorization") authorizationHeader: string | undefined
  ) {
    return this.examSessionsService.delete(examSessionId, authorizationHeader);
  }
}
