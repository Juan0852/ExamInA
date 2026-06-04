// @ts-nocheck
import { ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { GlobalExceptionFilter } from "./global-exception.filter";
import { ErrorCode } from "../errors/error-codes.enum";
import { AiProviderException } from "../errors/ai-provider.exception";

describe("GlobalExceptionFilter", () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: "/test",
      method: "GET",
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it("should map Zod validation issues to VALIDATION_ERROR and details.fields", () => {
    const issues = [{ path: "email", message: "Invalid email" }];
    const exception = new HttpException(
      { message: "Validation failed", issues },
      HttpStatus.BAD_REQUEST
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        code: ErrorCode.VALIDATION_ERROR,
        message: "Validation failed",
        details: { fields: issues },
        requestId: expect.any(String),
      }),
    });
  });

  it("should map UnauthorizedException to AUTH_REQUIRED", () => {
    const exception = new HttpException("Not logged in", HttpStatus.UNAUTHORIZED);
    
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        code: ErrorCode.AUTH_REQUIRED,
        message: "Not logged in",
      }),
    });
  });

  it("should handle AiProviderException correctly", () => {
    const exception = new AiProviderException("Custom AI failure");

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(502);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        code: ErrorCode.AI_PROVIDER_ERROR,
        message: "Custom AI failure",
      }),
    });
  });

  it("should mask unhandled Error and return 500 INTERNAL_SERVER_ERROR", () => {
    const exception = new Error("Database password exposed!");

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: expect.objectContaining({
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "Something went wrong. Please try again later.",
      }),
    });
    // The exposed string should not be in the output
    const callArgs = mockResponse.json.mock.calls[0][0];
    expect(callArgs.error.message).not.toContain("Database password exposed!");
  });
});
