import { Response } from 'express';
import { transactionService } from '../services/transactionService.js';
import { AuthenticatedRequest } from '../types/index.js';

export const transactionController = {
  async getAll(req: AuthenticatedRequest, res: Response) {
    const { page, limit, userId, status } = req.query;
    const result = await transactionService.getAll(
      Number(page) || 1,
      Number(limit) || 20,
      userId as string,
      status as string
    );
    res.json({ success: true, data: result });
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const transaction = await transactionService.getById(req.params.id as string);
    res.json({ success: true, data: transaction });
  },

  async getByReceiptNumber(req: AuthenticatedRequest, res: Response) {
    const transaction = await transactionService.getByReceiptNumber(req.params.receiptNumber as string);
    res.json({ success: true, data: transaction });
  },

  async create(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId;
    const result = await transactionService.create(userId, req.body) as any;

    if (result.payment_pending) {
      res.status(202).json({ success: true, data: result });
    } else {
      res.status(201).json({ success: true, data: result });
    }
  },

  async refund(req: AuthenticatedRequest, res: Response) {
    const transaction = await transactionService.refund(req.params.id as string, req.body, req.user!.role);
    res.json({ success: true, data: transaction });
  },

  async getDailySales(req: AuthenticatedRequest, res: Response) {
    const date = req.query.date ? new Date(req.query.date as string) : undefined;
    const result = await transactionService.getDailySales(date);
    res.json({ success: true, data: result });
  },
};