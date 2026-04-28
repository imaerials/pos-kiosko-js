import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { LoginInput } from '../utils/validation.js';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as LoginInput;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const profile = await authService.getProfile(req.user.userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response) {
  res.json({ message: 'Logged out successfully' });
}
