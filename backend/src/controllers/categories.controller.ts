import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service.js';

export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
}

export async function getCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.getCategoryById(req.params.id as string);
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = await categoryService.updateCategory(req.params.id as string, req.body);
    res.json(category);
  } catch (error) {
    next(error);
  }
}
