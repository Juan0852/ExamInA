import { Controller, Get, Headers, Inject, Post } from "@nestjs/common";
import { AchievementsService } from "../services/achievements.service";

@Controller("achievements")
export class AchievementsController {
  constructor(@Inject(AchievementsService) private readonly achievementsService: AchievementsService) {}

  @Get("me")
  findMine(@Headers("authorization") authorizationHeader?: string) {
    return this.achievementsService.findMine(authorizationHeader);
  }

  @Post("me/evaluate")
  evaluateMine(@Headers("authorization") authorizationHeader?: string) {
    return this.achievementsService.evaluateMine(authorizationHeader);
  }
}
