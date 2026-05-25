export interface HealthResponseDto {
  status: "ok";
  service: "api" | "database";
  timestamp: string;
}
