import { Body, Controller, Headers, Inject, Post } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import {
  evaluateWrittenAnswerRequestSchema,
  type EvaluateWrittenAnswerRequestDto
} from "../dtos/evaluate-written-answer-request.dto";
import {
  resetAttemptsRequestSchema,
  type ResetAttemptsRequestDto
} from "../dtos/reset-attempts-request.dto";
import { CorrectionsService } from "../services/corrections.service";

@Controller("corrections")
export class CorrectionsController {
  constructor(@Inject(CorrectionsService) private readonly correctionsService: CorrectionsService) {}

  @Post("evaluate-written-answer")
  evaluateWrittenAnswer(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body(new ZodValidationPipe(evaluateWrittenAnswerRequestSchema))
    data: EvaluateWrittenAnswerRequestDto
  ) {
    return this.correctionsService.evaluateWrittenAnswer(authorizationHeader, data);
  }

  @Post("reset-attempts")
  resetAttempts(
    @Headers("authorization") authorizationHeader: string | undefined,
    @Body(new ZodValidationPipe(resetAttemptsRequestSchema))
    data: ResetAttemptsRequestDto
  ) {
    return this.correctionsService.resetAttempts(authorizationHeader, data);
  }
}
