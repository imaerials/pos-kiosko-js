import { query } from '../config/database.js';
import { Inventory } from '../types/index.js';

export async function findInventoryByProductId(productId: string): Promise<Inventory | null> {
  const result = await query<Inventory>(
    'SELECT * FROM inventory WHERE product_id = $1',
    [productId]
  );
  return result.rows[0] || null;
}

export async function findAllInventory(): Promise<Inventory[]> {
  const result = await query<Inventory>(`
    SELECT i.*, p.name as product_name, p.sku
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    WHERE p.is_active = true
    ORDER BY i.quantity ASC
  `);
  return result.rows;
}

export async function findLowStockInventory(): Promise<Inventory[]> {
  const result = await query<Inventory>(`
    SELECT i.*, p.name as product_name, p.sku
    FROM inventory i
    JOIN products p ON i.product_id = p.id
    WHERE p.is_active = true AND i.quantity <= i.low_stock_threshold
    ORDER BY i.quantity ASC
  `);
  return result.rows;
}

export async function updateInventory(
  productId: string,
  quantity: number,
  lowStockThreshold?: number
): Promise<Inventory | null> {
  let sql = `
    UPDATE inventory
    SET quantity = $1, updated_at = CURRENT_TIMESTAMP
  `;
  const params: any[] = [quantity];
  let paramIndex = 2;

  if (lowStockThreshold !== undefined) {
    sql += `, low_stock_threshold = $${paramIndex++}`;
    params.push(lowStockThreshold);
  }

  sql += ` WHERE product_id = $${paramIndex} RETURNING *`;
  params.push(productId);

  const result = await query<Inventory>(sql, params);
  return result.rows[0] || null;
}

export async function restockInventory(
  productId: string,
  quantity: number
): Promise<Inventory | null> {
  const result = await query<Inventory>(`
    UPDATE inventory
    SET quantity = quantity + $1,
        last_restocked_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = $2
    RETURNING *
  `, [quantity, productId]);
  return result.rows[0] || null;
}
