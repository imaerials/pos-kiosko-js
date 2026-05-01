import { Request, Response } from 'express';
import { financeService } from '../services/financeService.js';

export const financeController = {
  async getSummary(req: Request, res: Response) {
    const period = (req.query.period as string) || 'month';
    if (!['today', 'week', 'month', 'year'].includes(period)) {
      res.status(400).json({ success: false, message: 'Invalid period' });
      return;
    }
    const data = await financeService.getSummary(period as 'today' | 'week' | 'month' | 'year');
    res.json({ success: true, data });
  },
};
