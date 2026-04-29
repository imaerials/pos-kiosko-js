import { RequestHandler } from 'express';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

type ValidateBodySchema = z.ZodSchema;

export function validateBody(schema: ValidateBodySchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return next(new ValidationError('Validation failed', errors));
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ValidateBodySchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return next(new ValidationError('Validation failed', errors));
    }

    req.query = result.data as any;
    next();
  };
}
