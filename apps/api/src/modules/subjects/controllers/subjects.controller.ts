import { Controller, Get, Inject, Param } from "@nestjs/common";
import { TopicsService } from "../../topics/services/topics.service";
import { SubjectsService } from "../services/subjects.service";

@Controller("subjects")
export class SubjectsController {
  constructor(
    @Inject(SubjectsService) private readonly subjectsService: SubjectsService,
    @Inject(TopicsService) private readonly topicsService: TopicsService
  ) {}

  @Get()
  findAll() {
    return this.subjectsService.findAll();
  }

  @Get(":subjectId/topics")
  findTopicsBySubject(@Param("subjectId") subjectId: string) {
    return this.topicsService.findAll({ subjectId });
  }
}
