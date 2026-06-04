export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number,
    public details?: unknown,
    public requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
