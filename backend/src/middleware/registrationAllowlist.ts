import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';
import { ForbiddenError } from '../utils/errors.js';

export function registrationAllowlist(req: Request, _res: Response, next: NextFunction) {
  const allowed = config.allowedRegistrationEmails;
  if (allowed.length === 0) return next();

  const email = String(req.body?.email ?? '').trim().toLowerCase();
  if (!allowed.includes(email)) {
    throw new ForbiddenError('Email not allowed to register');
  }
  next();
}
