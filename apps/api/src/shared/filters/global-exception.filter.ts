import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ErrorCode } from "../errors/error-codes.enum";
import { randomUUID } from "node:crypto";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>();
    const request = ctx.getRequest<any>();
    
    const requestId = randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = ErrorCode.INTERNAL_SERVER_ERROR;
    let message = "Something went wrong. Please try again later.";
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse: any = exception.getResponse();

      // Mapeo automático de códigos por status si no viene especificado
      code = exceptionResponse?.code || this.mapStatusToErrorCode(status);
      
      // Para errores controlados (HttpException), exponemos el mensaje
      message = exceptionResponse?.message || exception.message || message;
      details = exceptionResponse?.details || undefined;

      // ZodValidationPipe compatibility: it passes `issues` in the response
      if (status === HttpStatus.BAD_REQUEST && exceptionResponse?.issues) {
        code = ErrorCode.VALIDATION_ERROR;
        details = {
          fields: exceptionResponse.issues,
        };
      }
    } else {
      // It's a raw unhandled error (500)
      this.logger.error(`[${requestId}] Raw Error: ${exception instanceof Error ? exception.message : String(exception)}`, exception instanceof Error ? exception.stack : "");
    }

    // Log all exceptions internally with requestId
    if (status >= 500) {
      this.logger.error(`[${requestId}] ${request.method} ${request.url} - ${code}: ${message}`);
    } else {
      this.logger.warn(`[${requestId}] ${request.method} ${request.url} - ${code}: ${message}`);
    }

    response.status(status).json({
      error: {
        code,
        message,
        details,
        requestId,
      },
    });
  }

  private mapStatusToErrorCode(status: number): ErrorCode {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.AUTH_REQUIRED;
      case HttpStatus.FORBIDDEN:
        return ErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.RESOURCE_NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ErrorCode.RATE_LIMITED;
      case HttpStatus.BAD_GATEWAY:
      case HttpStatus.SERVICE_UNAVAILABLE:
      case HttpStatus.GATEWAY_TIMEOUT:
        return ErrorCode.EXTERNAL_SERVICE_ERROR;
      default:
        return ErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
