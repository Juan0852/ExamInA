import { Controller, Get, Headers, Inject, Query } from "@nestjs/common";
import { ZodValidationPipe } from "../../../shared/validation/zod-validation.pipe";
import {
  streakMonthsQuerySchema,
  type StreakMonthsQueryDto
} from "../dtos/streak-months-query.dto";
import { studyTimeQuerySchema, type StudyTimeQueryDto } from "../dtos/study-time-query.dto";
import { DashboardService } from "../services/dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly dashboardService: DashboardService) {}

  @Get("summary")
  getSummary(@Headers("authorization") authorizationHeader?: string) {
    return this.dashboardService.getSummary(authorizationHeader);
  }

  @Get("streak/months")
  getStreakMonths(
    @Query(new ZodValidationPipe(streakMonthsQuerySchema)) query: StreakMonthsQueryDto,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.dashboardService.getStreakMonths(query, authorizationHeader);
  }

  @Get("study-time")
  getStudyTime(
    @Query(new ZodValidationPipe(studyTimeQuerySchema)) query: StudyTimeQueryDto,
    @Headers("authorization") authorizationHeader?: string
  ) {
    return this.dashboardService.getStudyTime(query, authorizationHeader);
  }

  @Get("recent-exams")
  getRecentExams(@Headers("authorization") authorizationHeader?: string) {
    return this.dashboardService.getRecentExams(authorizationHeader);
  }
}
