import { Request, Response } from 'express';
import { productService } from '../services/productService.js';

export const productController = {
  async getAll(req: Request, res: Response) {
    const { categoryId, page, limit } = req.query;
    const result = await productService.getAll(categoryId as string);
    if (page || limit) {
      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 50;
      const data = await productService.search('', pageNum, limitNum);
      return res.json({ success: true, data });
    }
    res.json({ success: true, data: result });
  },

  async getById(req: Request, res: Response) {
    const product = await productService.getById(req.params.id as string);
    res.json({ success: true, data: product });
  },

  async getBySku(req: Request, res: Response) {
    const product = await productService.getBySku(req.params.sku as string);
    res.json({ success: true, data: product });
  },

  async getByBarcode(req: Request, res: Response) {
    const product = await productService.getByBarcode(req.params.barcode as string);
    res.json({ success: true, data: product });
  },

  async search(req: Request, res: Response) {
    const { q, page, limit } = req.query;
    if (!q) return res.json({ success: true, data: [] });
    const result = await productService.search(q as string, Number(page) || 1, Number(limit) || 20);
    res.json({ success: true, data: result });
  },

  async create(req: Request, res: Response) {
    const product = await productService.create(req.body);
    res.status(201).json({ success: true, data: product });
  },

  async update(req: Request, res: Response) {
    const product = await productService.update(req.params.id as string, req.body);
    res.json({ success: true, data: product });
  },

  async delete(req: Request, res: Response) {
    await productService.delete(req.params.id as string);
    res.json({ success: true, message: 'Product deleted' });
  },
};