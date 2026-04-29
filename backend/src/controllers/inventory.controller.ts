import { RequestHandler } from 'express';
import * as inventoryService from '../services/inventory.service.js';

export const getInventory: RequestHandler = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getAllInventory();
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const getLowStock: RequestHandler = async (req, res, next) => {
  try {
    const inventory = await inventoryService.getLowStockInventory();
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const updateInventory: RequestHandler<{ productId: string }> = async (req, res, next) => {
  try {
    const { quantity, low_stock_threshold } = req.body;
    const inventory = await inventoryService.updateInventory(
      req.params.productId,
      quantity,
      low_stock_threshold
    );
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};

export const restockInventory: RequestHandler = async (req, res, next) => {
  try {
    const { product_id, quantity } = req.body;
    const inventory = await inventoryService.restockInventory(product_id, quantity);
    res.json(inventory);
  } catch (error) {
    next(error);
  }
};
