import { Controller, Get, Inject } from "@nestjs/common";
import { HealthService } from "../services/health.service";

@Controller("health")
export class HealthController {
  constructor(@Inject(HealthService) private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    return this.healthService.getHealth();
  }

  @Get("live")
  getLiveness() {
    return this.healthService.getLiveness();
  }

  @Get("ready")
  getReadiness() {
    return this.healthService.getReadiness();
  }

  @Get("database")
  async getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }
}
