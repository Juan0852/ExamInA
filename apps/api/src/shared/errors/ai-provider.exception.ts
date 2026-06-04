import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode } from "./error-codes.enum";

export class AiProviderException extends HttpException {
  constructor(message = "AI provider failed") {
    super(
      {
        code: ErrorCode.AI_PROVIDER_ERROR,
        message,
      },
      HttpStatus.BAD_GATEWAY
    );
  }
}
