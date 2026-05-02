import { Response } from 'express';
import { authService } from '../services/authService.js';
import { loginSchema, registerSchema, createUserSchema } from '../utils/validation.js';
import { AuthenticatedRequest } from '../types/index.js';

export const authController = {
  async login(req: AuthenticatedRequest, res: Response) {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.json({ success: true, data: result });
  },

  async register(req: AuthenticatedRequest, res: Response) {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.json({ success: true, data: result });
  },

  async me(req: AuthenticatedRequest, res: Response) {
    const user = await authService.getProfile(req.user!.userId);
    res.json({ success: true, data: user });
  },

  async createUser(req: AuthenticatedRequest, res: Response) {
    const data = createUserSchema.parse(req.body);
    const result = await authService.createUser(data);
    res.json({ success: true, data: result });
  },
};