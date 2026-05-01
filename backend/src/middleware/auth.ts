import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthenticatedRequest } from '../types/index.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('No token provided');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string; role: string };
    req.user = { userId: decoded.userId, email: decoded.email, role: decoded.role as 'cashier' | 'manager' | 'admin' };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};