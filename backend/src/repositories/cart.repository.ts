import { and, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { cartItems, carts, products } from '../db/schema.js';
import type { Cart, CartItem } from '../types/index.js';

export interface CartWithItems extends Cart {
  items: (CartItem & { product_name: string; product_sku: string })[];
}

const cartItemSelect = {
  id: cartItems.id,
  cart_id: cartItems.cart_id,
  product_id: cartItems.product_id,
  quantity: cartItems.quantity,
  unit_price: cartItems.unit_price,
  created_at: cartItems.created_at,
  updated_at: cartItems.updated_at,
  product_name: products.name,
  product_sku: products.sku,
};

async function fetchCartItems(cartId: string) {
  return db.select(cartItemSelect)
    .from(cartItems)
    .innerJoin(products, eq(cartItems.product_id, products.id))
    .where(eq(cartItems.cart_id, cartId));
}

export async function findCartById(id: string): Promise<CartWithItems | null> {
  const [cart] = await db.select().from(carts)
    .where(and(eq(carts.id, id), eq(carts.status, 'active')))
    .limit(1);
  if (!cart) return null;

  const items = await fetchCartItems(cart.id);
  return { ...cart, items };
}

export async function findCartByUserId(userId: string): Promise<CartWithItems | null> {
  const [cart] = await db.select().from(carts)
    .where(and(eq(carts.user_id, userId), eq(carts.status, 'active')))
    .orderBy(desc(carts.created_at))
    .limit(1);
  if (!cart) return null;

  const items = await fetchCartItems(cart.id);
  return { ...cart, items };
}

export async function findCartBySessionId(sessionId: string): Promise<CartWithItems | null> {
  const [cart] = await db.select().from(carts)
    .where(and(eq(carts.session_id, sessionId), eq(carts.status, 'active')))
    .orderBy(desc(carts.created_at))
    .limit(1);
  if (!cart) return null;

  const items = await fetchCartItems(cart.id);
  return { ...cart, items };
}

export async function createCart(userId?: string, sessionId?: string): Promise<Cart> {
  const [row] = await db.insert(carts)
    .values({ user_id: userId, session_id: sessionId })
    .returning();
  return row;
}

export async function addCartItem(
  cartId: string,
  productId: string,
  quantity: number,
  unitPrice: number
): Promise<CartItem> {
  const [existing] = await db.select().from(cartItems)
    .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.product_id, productId)))
    .limit(1);

  if (existing) {
    const [row] = await db.update(cartItems)
      .set({ quantity: existing.quantity + quantity, updated_at: new Date() })
      .where(and(eq(cartItems.cart_id, cartId), eq(cartItems.product_id, productId)))
      .returning();
    return row;
  }

  const [row] = await db.insert(cartItems)
    .values({ cart_id: cartId, product_id: productId, quantity, unit_price: unitPrice })
    .returning();
  return row;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<CartItem | null> {
  const [row] = await db.update(cartItems)
    .set({ quantity, updated_at: new Date() })
    .where(eq(cartItems.id, itemId))
    .returning();
  return row ?? null;
}

export async function removeCartItem(itemId: string): Promise<boolean> {
  const result = await db.delete(cartItems)
    .where(eq(cartItems.id, itemId))
    .returning({ id: cartItems.id });
  return result.length > 0;
}

export async function clearCart(cartId: string): Promise<void> {
  await db.delete(cartItems).where(eq(cartItems.cart_id, cartId));
}

export async function convertCartToTransaction(cartId: string): Promise<void> {
  await db.update(carts)
    .set({ status: 'converted', updated_at: new Date() })
    .where(eq(carts.id, cartId));
}
