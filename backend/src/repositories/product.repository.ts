import { query } from '../config/database.js';
import { Product, Inventory } from '../types/index.js';

export interface ProductWithInventory extends Product {
  inventory?: Inventory;
}

export async function findAllProducts(categoryId?: string): Promise<ProductWithInventory[]> {
  let sql = `
    SELECT p.*, i.quantity, i.low_stock_threshold, i.last_restocked_at,
           c.name as category_name, c.slug as category_slug
    FROM products p
    LEFT JOIN inventory i ON p.id = i.product_id
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true
  `;
  const params: any[] = [];

  if (categoryId) {
    sql += ` AND p.category_id = $1`;
    params.push(categoryId);
  }

  sql += ' ORDER BY c.sort_order, p.name';

  const result = await query<ProductWithInventory>(sql, params);
  return result.rows;
}

export async function findProductById(id: string): Promise<ProductWithInventory | null> {
  const result = await query<ProductWithInventory>(
    `SELECT p.*, i.quantity, i.low_stock_threshold, i.last_restocked_at,
            c.name as category_name, c.slug as category_slug
     FROM products p
     LEFT JOIN inventory i ON p.id = i.product_id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.id = $1 AND p.is_active = true`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findProductByBarcode(barcode: string): Promise<ProductWithInventory | null> {
  const result = await query<ProductWithInventory>(
    `SELECT p.*, i.quantity, i.low_stock_threshold, i.last_restocked_at,
            c.name as category_name, c.slug as category_slug
     FROM products p
     LEFT JOIN inventory i ON p.id = i.product_id
     LEFT JOIN categories c ON p.category_id = c.id
     WHERE p.barcode = $1 AND p.is_active = true`,
    [barcode]
  );
  return result.rows[0] || null;
}

export async function findProductBySku(sku: string): Promise<Product | null> {
  const result = await query<Product>(
    'SELECT * FROM products WHERE sku = $1 AND is_active = true',
    [sku]
  );
  return result.rows[0] || null;
}

export async function createProduct(data: {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  category_id?: string;
  image_url?: string;
}): Promise<Product> {
  const result = await query<Product>(
    `INSERT INTO products (sku, barcode, name, description, price, cost, category_id, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [data.sku, data.barcode, data.name, data.description, data.price, data.cost, data.category_id, data.image_url]
  );

  await query(
    'INSERT INTO inventory (product_id, quantity) VALUES ($1, 0)',
    [result.rows[0].id]
  );

  return result.rows[0];
}

export async function updateProduct(
  id: string,
  data: Partial<{
    sku: string;
    barcode: string;
    name: string;
    description: string;
    price: number;
    cost: number;
    category_id: string;
    image_url: string;
  }>
): Promise<Product | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.sku !== undefined) { fields.push(`sku = $${paramIndex++}`); values.push(data.sku); }
  if (data.barcode !== undefined) { fields.push(`barcode = $${paramIndex++}`); values.push(data.barcode); }
  if (data.name !== undefined) { fields.push(`name = $${paramIndex++}`); values.push(data.name); }
  if (data.description !== undefined) { fields.push(`description = $${paramIndex++}`); values.push(data.description); }
  if (data.price !== undefined) { fields.push(`price = $${paramIndex++}`); values.push(data.price); }
  if (data.cost !== undefined) { fields.push(`cost = $${paramIndex++}`); values.push(data.cost); }
  if (data.category_id !== undefined) { fields.push(`category_id = $${paramIndex++}`); values.push(data.category_id); }
  if (data.image_url !== undefined) { fields.push(`image_url = $${paramIndex++}`); values.push(data.image_url); }

  if (fields.length === 0) return findProductById(id);

  values.push(id);
  const result = await query<Product>(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await query(
    'UPDATE products SET is_active = false WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
