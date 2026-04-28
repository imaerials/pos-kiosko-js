import * as cartRepo from '../repositories/cart.repository.js';
import * as productRepo from '../repositories/product.repository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export async function getCart(userId?: string, sessionId?: string) {
  let cart: cartRepo.CartWithItems | null = null;

  if (userId) {
    cart = await cartRepo.findCartByUserId(userId);
  } else if (sessionId) {
    cart = await cartRepo.findCartBySessionId(sessionId);
  }

  if (!cart) {
    cart = await cartRepo.createCart(userId, sessionId) as cartRepo.CartWithItems;
    cart.items = [];
  }

  return cart;
}

export async function addItemToCart(
  cartId: string,
  productId: string,
  quantity: number
) {
  const product = await productRepo.findProductById(productId);
  if (!product) {
    throw new NotFoundError('Product');
  }

  const item = await cartRepo.addCartItem(cartId, productId, quantity, Number(product.price));
  return item;
}

export async function updateCartItem(itemId: string, cartId: string, quantity: number) {
  const cart = await cartRepo.findCartById(cartId);
  if (!cart) {
    throw new NotFoundError('Cart');
  }

  const item = cart.items.find(i => i.id === itemId);
  if (!item) {
    throw new NotFoundError('Cart item');
  }

  if (quantity <= 0) {
    await cartRepo.removeCartItem(itemId);
    return { success: true };
  }

  return cartRepo.updateCartItem(itemId, quantity);
}

export async function removeCartItem(itemId: string, cartId: string) {
  const cart = await cartRepo.findCartById(cartId);
  if (!cart) {
    throw new NotFoundError('Cart');
  }

  const item = cart.items.find(i => i.id === itemId);
  if (!item) {
    throw new NotFoundError('Cart item');
  }

  const removed = await cartRepo.removeCartItem(itemId);
  if (!removed) {
    throw new NotFoundError('Cart item');
  }

  return { success: true };
}

export async function clearCart(cartId: string) {
  await cartRepo.clearCart(cartId);
  return { success: true };
}
