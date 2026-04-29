import { Request, Response, NextFunction } from 'express';
import * as financeRepo from '../repositories/finance.repository.js';

const VALID_PERIODS = ['today', 'week', 'month', 'year'];

export async function getSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const period = VALID_PERIODS.includes(req.query.period as string)
      ? (req.query.period as string)
      : 'month';
    const summary = await financeRepo.getFinanceSummary(period);
    res.json(summary);
  } catch (error) {
    next(error);
  }
}
