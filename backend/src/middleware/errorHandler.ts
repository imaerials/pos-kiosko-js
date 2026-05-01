import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  console.error('Unexpected error:', err);

  return res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
};