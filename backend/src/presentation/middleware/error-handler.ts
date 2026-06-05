import { Request, Response, NextFunction } from 'express';
import { DomainError } from '../../shared/errors';
import { error as errorResponse } from '../helpers/response';

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ErrorHandler]', err);

  if (err instanceof DomainError) {
    res.status(err.statusCode).json(errorResponse(err.message));
    return;
  }

  res.status(500).json(errorResponse('Internal server error'));
}
