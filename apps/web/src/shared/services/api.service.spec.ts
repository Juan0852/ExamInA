// @ts-nocheck
import { ApiError } from "../errors/api-error";
import { useAuthStore } from "../../stores/auth.store";
// A bit of a hack to mock fetch before api.service loads
global.fetch = jest.fn();
const { api } = require("./api.service");

describe("api.service", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useAuthStore.setState({ token: null, user: null, refreshToken: null });
  });

  it("should throw ApiError with standard format", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: { fields: [{ field: "email", message: "invalid" }] },
          requestId: "req-123"
        }
      })
    });

    await expect(api.get("/test")).rejects.toThrow(ApiError);
    await expect(api.get("/test")).rejects.toMatchObject({
      code: "VALIDATION_ERROR",
      message: "Validation failed",
      status: 400,
      details: { fields: [{ field: "email", message: "invalid" }] },
      requestId: "req-123"
    });
  });

  it("should parse legacy format errors defensively", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: jest.fn().mockResolvedValue({
        message: "You do not have access"
      })
    });

    await expect(api.get("/test")).rejects.toMatchObject({
      code: "UNKNOWN_ERROR",
      message: "You do not have access",
      status: 403,
    });
  });

  it("should fallback to statusText if non-JSON error", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON"))
    });

    await expect(api.get("/test")).rejects.toMatchObject({
      code: "UNKNOWN_ERROR",
      message: "Internal Server Error",
      status: 500,
    });
  });
});
