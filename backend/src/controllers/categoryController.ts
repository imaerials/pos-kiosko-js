import { Request, Response } from 'express';
import { categoryService } from '../services/categoryService.js';

export const categoryController = {
  async getAll(_req: Request, res: Response) {
    const categories = await categoryService.getAll();
    res.json({ success: true, data: categories });
  },

  async getById(req: Request, res: Response) {
    const category = await categoryService.getById(req.params.id as string);
    res.json({ success: true, data: category });
  },

  async getBySlug(req: Request, res: Response) {
    const category = await categoryService.getBySlug(req.params.slug as string);
    res.json({ success: true, data: category });
  },

  async create(req: Request, res: Response) {
    const category = await categoryService.create(req.body);
    res.status(201).json({ success: true, data: category });
  },

  async update(req: Request, res: Response) {
    const category = await categoryService.update(req.params.id as string, req.body);
    res.json({ success: true, data: category });
  },

  async delete(req: Request, res: Response) {
    await categoryService.delete(req.params.id as string);
    res.json({ success: true, message: 'Category deleted' });
  },
};