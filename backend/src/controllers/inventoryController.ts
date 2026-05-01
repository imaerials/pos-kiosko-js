import { Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService.js';

export const inventoryController = {
  async getAll(_req: Request, res: Response) {
    const inventory = await inventoryService.getAll();
    res.json({ success: true, data: inventory });
  },

  async getByProductId(req: Request, res: Response) {
    const inventory = await inventoryService.getByProductId(req.params.productId as string);
    res.json({ success: true, data: inventory });
  },

  async update(req: Request, res: Response) {
    const inventory = await inventoryService.update(req.params.productId as string, req.body);
    res.json({ success: true, data: inventory });
  },

  async restock(req: Request, res: Response) {
    const inventory = await inventoryService.restock(req.body);
    res.json({ success: true, data: inventory });
  },

  async getLowStock(req: Request, res: Response) {
    const threshold = req.query.threshold ? Number(req.query.threshold) : undefined;
    const inventory = await inventoryService.getLowStock(threshold);
    res.json({ success: true, data: inventory });
  },
};