import { Request, Response, NextFunction } from 'express';
import * as inventoryService from '../services/inventory.service.js';

export async function getInventory(_req: Request, res: Response, next: NextFunction) {
  try {
    const inventory = await inventoryService.getAllInventory();
    res.json(inventory);
  } catch (error) {
    next(error);
  }
}

export async function getLowStock(_req: Request, res: Response, next: NextFunction) {
  try {
    const inventory = await inventoryService.getLowStockInventory();
    res.json(inventory);
  } catch (error) {
    next(error);
  }
}

export async function updateInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { quantity, low_stock_threshold } = req.body;
    const inventory = await inventoryService.updateInventory(
      req.params.productId as string,
      quantity,
      low_stock_threshold
    );
    res.json(inventory);
  } catch (error) {
    next(error);
  }
}

export async function restockInventory(req: Request, res: Response, next: NextFunction) {
  try {
    const { product_id, quantity } = req.body;
    const inventory = await inventoryService.restockInventory(product_id, quantity);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
}
