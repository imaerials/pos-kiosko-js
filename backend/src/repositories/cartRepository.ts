import prisma from '../config/database.js';

export const cartRepository = {
  async findById(id: string) {
    return prisma.cart.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
  },

  async findByUserId(userId: string) {
    return prisma.cart.findFirst({
      where: { userId, status: 'Active' },
      include: { items: { include: { product: true } } },
    });
  },

  async findBySessionId(sessionId: string) {
    return prisma.cart.findFirst({
      where: { sessionId, status: 'Active' },
      include: { items: { include: { product: true } } },
    });
  },

  async create(data: { userId?: string; sessionId?: string }) {
    return prisma.cart.create({ data });
  },

  async addItem(cartId: string, data: { productId: string; quantity: number; unitPrice: number }) {
    const existing = await prisma.cartItem.findFirst({
      where: { cartId, productId: data.productId },
    });

    if (existing) {
      return prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: data.quantity } },
      });
    }

    return prisma.cartItem.create({
      data: { ...data, cartId },
    });
  },

  async updateItem(itemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  },

  async removeItem(itemId: string) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  },

  async clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },

  async convertToTransaction(cartId: string) {
    return prisma.cart.update({
      where: { id: cartId },
      data: { status: 'Converted' },
    });
  },

  async delete(id: string) {
    return prisma.cart.delete({ where: { id } });
  },
};