import { inventoryRepository } from '../repositories/inventoryRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { UpdateInventoryInput, RestockInput } from '../utils/validation.js';
import { NotFoundError } from '../utils/errors.js';

export const inventoryService = {
  async getByProductId(productId: string) {
    const inventory = await inventoryRepository.findByProductId(productId);
    if (!inventory) throw new NotFoundError('Inventory');
    return inventory;
  },

  async update(productId: string, data: UpdateInventoryInput) {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError('Product');

    return inventoryRepository.upsert(productId, data);
  },

  async restock({ productId, quantity }: RestockInput) {
    const product = await productRepository.findById(productId);
    if (!product) throw new NotFoundError('Product');

    return inventoryRepository.incrementQuantity(productId, quantity);
  },

  async getLowStock(threshold?: number) {
    return inventoryRepository.findLowStock(threshold ?? 10);
  },
};