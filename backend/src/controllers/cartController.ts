import { Response } from 'express';
import { cartService } from '../services/cartService.js';
import { AuthenticatedRequest } from '../types/index.js';

export const cartController = {
  async getOrCreate(req: AuthenticatedRequest, res: Response) {
    const userId = req.user?.userId;
    const sessionId = req.headers['x-session-id'] as string;
    const cart = await cartService.getOrCreate(userId, sessionId);
    res.json({ success: true, data: cart });
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    const cart = await cartService.getById(req.params.id as string);
    res.json({ success: true, data: cart });
  },

  async addItem(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const item = await cartService.addItem(id as string, req.body);
    res.status(201).json({ success: true, data: item });
  },

  async updateItem(req: AuthenticatedRequest, res: Response) {
    const { id, itemId } = req.params as { id: string; itemId: string };
    const item = await cartService.updateItem(itemId, req.body, id);
    res.json({ success: true, data: item });
  },

  async removeItem(req: AuthenticatedRequest, res: Response) {
    await cartService.removeItem(req.params.itemId as string);
    res.json({ success: true, message: 'Item removed' });
  },

  async clearCart(req: AuthenticatedRequest, res: Response) {
    await cartService.clearCart(req.params.id as string);
    res.json({ success: true, message: 'Cart cleared' });
  },

  async deleteCart(req: AuthenticatedRequest, res: Response) {
    await cartService.deleteCart(req.params.id as string);
    res.json({ success: true, message: 'Cart deleted' });
  },
};