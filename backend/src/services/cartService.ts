import { cartRepository } from '../repositories/cartRepository.js';
import { inventoryRepository } from '../repositories/inventoryRepository.js';
import { AddCartItemInput, UpdateCartItemInput } from '../utils/validation.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const cartService = {
  async getOrCreate(userId?: string, sessionId?: string) {
    if (userId) {
      const cart = await cartRepository.findByUserId(userId);
      if (cart) return cart;
      return cartRepository.create({ userId });
    }

    if (sessionId) {
      const cart = await cartRepository.findBySessionId(sessionId);
      if (cart) return cart;
      return cartRepository.create({ sessionId });
    }

    throw new BadRequestError('User ID or session ID required');
  },

  async getById(id: string) {
    const cart = await cartRepository.findById(id);
    if (!cart) throw new NotFoundError('Cart');
    return cart;
  },

  async addItem(cartId: string, { productId, quantity }: AddCartItemInput) {
    const inventory = await inventoryRepository.findByProductId(productId);
    if (!inventory || inventory.quantity < quantity) {
      throw new BadRequestError('Insufficient inventory');
    }

    return cartRepository.addItem(cartId, {
      productId,
      quantity,
      unitPrice: 0,
    });
  },

  async updateItem(itemId: string, data: UpdateCartItemInput, cartId: string) {
    const cart = await cartRepository.findById(cartId);
    if (!cart) throw new NotFoundError('Cart');

    const item = cart.items.find(i => i.id === itemId);
    if (!item) throw new NotFoundError('Cart item');

    const inventory = await inventoryRepository.findByProductId(item.productId);
    if (!inventory || inventory.quantity < data.quantity) {
      throw new BadRequestError('Insufficient inventory');
    }

    return cartRepository.updateItem(itemId, data.quantity);
  },

  async removeItem(itemId: string) {
    return cartRepository.removeItem(itemId);
  },

  async clearCart(cartId: string) {
    return cartRepository.clearCart(cartId);
  },

  async deleteCart(id: string) {
    return cartRepository.delete(id);
  },
};