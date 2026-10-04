import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { AppError } from '../utils/app-error.js';

interface Schemas {
  body?: ZodType;
  params?: ZodType;
}

/**
 * Validates and coerces `req.body` / `req.params` with Zod. On failure responds 400 with
 * the messages joined by ", " — the same format as Spring's validation handler.
 * Parsed values are stored in `res.locals.body` / `res.locals.params`.
 */
export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const part of ['params', 'body'] as const) {
      const schema = schemas[part];
      if (!schema) continue;
      const result = schema.safeParse(req[part] ?? {});
      if (!result.success) {
        const message = [...new Set(result.error.issues.map((i) => i.message))].join(', ');
        throw AppError.validation(message);
      }
      res.locals[part] = result.data;
    }
    next();
  };
}
