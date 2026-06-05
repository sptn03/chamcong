export class DomainError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string = 'Validation failed') {
    super(message, 400);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
  }
}
