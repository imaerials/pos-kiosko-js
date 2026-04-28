import { query, getClient } from '../config/database.js';
import { Cart, CartItem } from '../types/index.js';

export interface CartWithItems extends Cart {
  items: (CartItem & { product_name: string; product_sku: string })[];
}

export async function findCartById(id: string): Promise<CartWithItems | null> {
  const cartResult = await query<Cart>(
    'SELECT * FROM carts WHERE id = $1 AND status = $2',
    [id, 'active']
  );

  if (cartResult.rows.length === 0) return null;

  const itemsResult = await query<CartItem & { product_name: string; product_sku: string }>(`
    SELECT ci.*, p.name as product_name, p.sku as product_sku
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1
  `, [id]);

  return {
    ...cartResult.rows[0],
    items: itemsResult.rows,
  };
}

export async function findCartByUserId(userId: string): Promise<CartWithItems | null> {
  const cartResult = await query<Cart>(
    'SELECT * FROM carts WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
    [userId, 'active']
  );

  if (cartResult.rows.length === 0) return null;

  const itemsResult = await query<CartItem & { product_name: string; product_sku: string }>(`
    SELECT ci.*, p.name as product_name, p.sku as product_sku
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1
  `, [cartResult.rows[0].id]);

  return {
    ...cartResult.rows[0],
    items: itemsResult.rows,
  };
}

export async function findCartBySessionId(sessionId: string): Promise<CartWithItems | null> {
  const cartResult = await query<Cart>(
    'SELECT * FROM carts WHERE session_id = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
    [sessionId, 'active']
  );

  if (cartResult.rows.length === 0) return null;

  const itemsResult = await query<CartItem & { product_name: string; product_sku: string }>(`
    SELECT ci.*, p.name as product_name, p.sku as product_sku
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = $1
  `, [cartResult.rows[0].id]);

  return {
    ...cartResult.rows[0],
    items: itemsResult.rows,
  };
}

export async function createCart(userId?: string, sessionId?: string): Promise<Cart> {
  const result = await query<Cart>(
    'INSERT INTO carts (user_id, session_id) VALUES ($1, $2) RETURNING *',
    [userId, sessionId]
  );
  return result.rows[0];
}

export async function addCartItem(
  cartId: string,
  productId: string,
  quantity: number,
  unitPrice: number
): Promise<CartItem> {
  const existingResult = await query<CartItem>(
    'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cartId, productId]
  );

  if (existingResult.rows.length > 0) {
    const existing = existingResult.rows[0];
    const result = await query<CartItem>(
      `UPDATE cart_items
       SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
       WHERE cart_id = $2 AND product_id = $3
       RETURNING *`,
      [quantity, cartId, productId]
    );
    return result.rows[0];
  }

  const result = await query<CartItem>(
    `INSERT INTO cart_items (cart_id, product_id, quantity, unit_price)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [cartId, productId, quantity, unitPrice]
  );
  return result.rows[0];
}

export async function updateCartItem(
  itemId: string,
  quantity: number
): Promise<CartItem | null> {
  const result = await query<CartItem>(
    'UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [quantity, itemId]
  );
  return result.rows[0] || null;
}

export async function removeCartItem(itemId: string): Promise<boolean> {
  const result = await query('DELETE FROM cart_items WHERE id = $1', [itemId]);
  return (result.rowCount ?? 0) > 0;
}

export async function clearCart(cartId: string): Promise<void> {
  await query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
}

export async function convertCartToTransaction(cartId: string): Promise<void> {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query(
      "UPDATE carts SET status = 'converted', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [cartId]
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
