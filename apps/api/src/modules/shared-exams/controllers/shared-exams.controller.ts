import { Controller, Get, Headers, Inject, Param, Post, Query, Patch, Body } from "@nestjs/common";
import { SharedExamsService } from "../services/shared-exams.service";

@Controller("shared-exams")
export class SharedExamsController {
  constructor(@Inject(SharedExamsService) private readonly sharedExamsService: SharedExamsService) {}

  @Get()
  findPublished(@Query("subjectId") subjectId?: string) {
    return this.sharedExamsService.findPublished({ subjectId });
  }

  @Get("me")
  findMine(@Headers("authorization") authorizationHeader?: string) {
    return this.sharedExamsService.findMine(authorizationHeader);
  }

  @Patch(":sharedExamId/visibility")
  updateVisibility(
    @Param("sharedExamId") sharedExamId: string,
    @Body("visibility") visibility: string,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.sharedExamsService.updateVisibility(sharedExamId, visibility, authorizationHeader);
  }

  @Post(":sharedExamId/start")
  start(
    @Param("sharedExamId") sharedExamId: string,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.sharedExamsService.start(sharedExamId, authorizationHeader);
  }
}

