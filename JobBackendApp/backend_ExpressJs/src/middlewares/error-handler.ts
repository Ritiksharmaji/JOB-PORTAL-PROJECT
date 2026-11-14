import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { logger } from '../config/logger.js';
import { ERROR_MESSAGES } from '../constants/messages.js';
import { AppError } from '../utils/app-error.js';

/** Same body as Spring's ErrorInfo: `{ errorMessage, errorCode, timeStamp }`. */
function send(res: Response, status: number, message: string): void {
  res.status(status).json({ errorMessage: message, errorCode: status, timeStamp: new Date().toISOString() });
}

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError('ROUTE_NOT_FOUND'));
}

// Express recognises error handlers by their 4 arguments, so `_next` must stay.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) return send(res, err.status, err.message);

  // Malformed JSON body.
  if (err instanceof SyntaxError && 'body' in err) return send(res, 400, 'Malformed JSON request body.');
  // Body larger than the configured limit (e.g. a huge resume upload).
  if ((err as { type?: string }).type === 'entity.too.large') return send(res, 413, 'Request body is too large.');
  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
    return send(res, 400, err.message);
  }
  // Duplicate key (e.g. two registrations with the same email at the same moment).
  if ((err as { code?: number }).code === 11000) return send(res, 409, ERROR_MESSAGES.USER_FOUND);

  logger.error({ err, path: req.path }, 'Unhandled error');
  send(res, 500, ERROR_MESSAGES.INTERNAL);
}
