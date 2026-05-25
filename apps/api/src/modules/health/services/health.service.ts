import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import type { HealthResponseDto } from "../dtos/health-response.dto";
import { PrismaService } from "../../../shared/database/prisma.service";

@Injectable()
export class HealthService {
  constructor(@Inject(PrismaService) private readonly prismaService: PrismaService) {}

  getHealth(): HealthResponseDto {
    return this.createOkResponse();
  }

  getLiveness(): HealthResponseDto {
    return this.createOkResponse();
  }

  getReadiness(): HealthResponseDto {
    return this.createOkResponse();
  }

  async getDatabaseHealth(): Promise<HealthResponseDto> {
    try {
      await this.prismaService.checkConnection();

      return this.createOkResponse("database");
    } catch (error) {
      throw new ServiceUnavailableException({
        status: "unavailable",
        service: "database",
        message: error instanceof Error ? error.message : "Database health check failed."
      });
    }
  }

  private createOkResponse(service: HealthResponseDto["service"] = "api"): HealthResponseDto {
    return {
      status: "ok",
      service,
      timestamp: new Date().toISOString()
    };
  }
}
