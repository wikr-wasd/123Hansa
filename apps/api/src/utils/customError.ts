export class CustomError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }

    this.name = this.constructor.name;
  }
}

// Convenience functions for common errors
export const createError = {
  badRequest: (message: string = 'Bad Request') => new CustomError(message, 400),
  unauthorized: (message: string = 'Unauthorized') => new CustomError(message, 401),
  forbidden: (message: string = 'Forbidden') => new CustomError(message, 403),
  notFound: (message: string = 'Not Found') => new CustomError(message, 404),
  conflict: (message: string = 'Conflict') => new CustomError(message, 409),
  unprocessableEntity: (message: string = 'Unprocessable Entity') => new CustomError(message, 422),
  tooManyRequests: (message: string = 'Too Many Requests') => new CustomError(message, 429),
  internal: (message: string = 'Internal Server Error') => new CustomError(message, 500),
  notImplemented: (message: string = 'Not Implemented') => new CustomError(message, 501),
  badGateway: (message: string = 'Bad Gateway') => new CustomError(message, 502),
  serviceUnavailable: (message: string = 'Service Unavailable') => new CustomError(message, 503),
};

export default CustomError;