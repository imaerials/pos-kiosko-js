import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors.js';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
      const parsed = schema.parse(data);
      if (source === 'body') req.body = parsed;
      else if (source === 'query') req.query = parsed;
      else req.params = parsed;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new BadRequestError(message);
      }
      throw error;
    }
  };
};