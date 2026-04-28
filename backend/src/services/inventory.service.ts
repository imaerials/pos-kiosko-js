import * as inventoryRepo from '../repositories/inventory.repository.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllInventory() {
  return inventoryRepo.findAllInventory();
}

export async function getLowStockInventory() {
  return inventoryRepo.findLowStockInventory();
}

export async function updateInventory(
  productId: string,
  quantity: number,
  lowStockThreshold?: number
) {
  const inventory = await inventoryRepo.updateInventory(productId, quantity, lowStockThreshold);
  if (!inventory) {
    throw new NotFoundError('Inventory');
  }
  return inventory;
}

export async function restockInventory(productId: string, quantity: number) {
  const inventory = await inventoryRepo.restockInventory(productId, quantity);
  if (!inventory) {
    throw new NotFoundError('Inventory');
  }
  return inventory;
}
