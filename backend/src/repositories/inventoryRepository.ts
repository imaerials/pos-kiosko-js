import prisma from '../config/database.js';

export const inventoryRepository = {
  async findByProductId(productId: string) {
    return prisma.inventory.findUnique({ where: { productId } });
  },

  async update(productId: string, data: { quantity?: number; lowStockThreshold?: number }) {
    return prisma.inventory.update({
      where: { productId },
      data: {
        ...data,
        lastRestockedAt: data.quantity !== undefined ? new Date() : undefined,
      },
    });
  },

  async upsert(productId: string, data: { quantity?: number; lowStockThreshold?: number }) {
    return prisma.inventory.upsert({
      where: { productId },
      update: data,
      create: { productId, quantity: data.quantity ?? 0, lowStockThreshold: data.lowStockThreshold ?? 10 },
    });
  },

  async findLowStock(threshold = 10) {
    return prisma.inventory.findMany({
      where: { quantity: { lte: threshold } },
      include: { product: true },
      orderBy: { quantity: 'asc' },
    });
  },

  async decrementQuantity(productId: string, quantity: number) {
    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({ where: { productId } });
      if (!inventory || inventory.quantity < quantity) {
        throw new Error('Insufficient inventory');
      }
      return tx.inventory.update({
        where: { productId },
        data: { quantity: { decrement: quantity } },
      });
    });
  },

  async incrementQuantity(productId: string, quantity: number) {
    return prisma.inventory.update({
      where: { productId },
      data: { quantity: { increment: quantity }, lastRestockedAt: new Date() },
    });
  },
};