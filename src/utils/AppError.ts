export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: Record<string, string>,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static badRequest(message: string) { return new AppError(400, message); }
  static notFound(message = 'Resource not found') { return new AppError(404, message); }
  static validation(errors: Record<string, string>) { return new AppError(422, 'Validation failed', errors); }
}
