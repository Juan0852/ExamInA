import { Injectable } from "@nestjs/common";
import type { HealthResponseDto } from "../dtos/health-response.dto";

@Injectable()
export class HealthService {
  getHealth(): HealthResponseDto {
    return this.createOkResponse();
  }

  getLiveness(): HealthResponseDto {
    return this.createOkResponse();
  }

  getReadiness(): HealthResponseDto {
    return this.createOkResponse();
  }

  private createOkResponse(): HealthResponseDto {
    return {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString()
    };
  }
}
