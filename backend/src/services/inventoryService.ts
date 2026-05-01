import prisma from '../config/database.js';
import { inventoryRepository } from '../repositories/inventoryRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { UpdateInventoryInput, RestockInput } from '../utils/validation.js';
import { NotFoundError } from '../utils/errors.js';

export const inventoryService = {
  async getAll() {
    const records = await prisma.inventory.findMany({
      include: { product: { select: { name: true, sku: true } } },
      orderBy: { product: { name: 'asc' } },
    });
    return records.map((r) => ({
      id: r.id,
      product_id: r.productId,
      quantity: r.quantity,
      low_stock_threshold: r.lowStockThreshold,
      product_name: r.product.name,
      sku: r.product.sku,
    }));
  },

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