import { Controller, Get, Headers, Inject, Param, Post, Query } from "@nestjs/common";
import { SharedExamsService } from "../services/shared-exams.service";

@Controller("shared-exams")
export class SharedExamsController {
  constructor(@Inject(SharedExamsService) private readonly sharedExamsService: SharedExamsService) {}

  @Get()
  findPublished(@Query("subjectId") subjectId?: string) {
    return this.sharedExamsService.findPublished({ subjectId });
  }

  @Post(":sharedExamId/start")
  start(
    @Param("sharedExamId") sharedExamId: string,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.sharedExamsService.start(sharedExamId, authorizationHeader);
  }
}
