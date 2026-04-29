import { and, asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { categories, inventory, products } from '../db/schema.js';
import type { Product } from '../types/index.js';

export interface ProductWithInventory extends Product {
  quantity: number | null;
  low_stock_threshold: number | null;
  last_restocked_at: Date | null;
  category_name: string | null;
  category_slug: string | null;
}

const productSelect = {
  id: products.id,
  sku: products.sku,
  barcode: products.barcode,
  name: products.name,
  description: products.description,
  price: products.price,
  cost: products.cost,
  category_id: products.category_id,
  image_url: products.image_url,
  is_active: products.is_active,
  created_at: products.created_at,
  updated_at: products.updated_at,
  quantity: inventory.quantity,
  low_stock_threshold: inventory.low_stock_threshold,
  last_restocked_at: inventory.last_restocked_at,
  category_name: categories.name,
  category_slug: categories.slug,
};

export async function findAllProducts(categoryId?: string): Promise<ProductWithInventory[]> {
  const baseQuery = db.select(productSelect)
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.product_id))
    .leftJoin(categories, eq(products.category_id, categories.id));

  if (categoryId) {
    return baseQuery
      .where(and(eq(products.is_active, true), eq(products.category_id, categoryId)))
      .orderBy(asc(categories.sort_order), asc(products.name));
  }

  return baseQuery
    .where(eq(products.is_active, true))
    .orderBy(asc(categories.sort_order), asc(products.name));
}

export async function findProductById(id: string): Promise<ProductWithInventory | null> {
  const [row] = await db.select(productSelect)
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.product_id))
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(and(eq(products.id, id), eq(products.is_active, true)))
    .limit(1);
  return row ?? null;
}

export async function findProductByBarcode(barcode: string): Promise<ProductWithInventory | null> {
  const [row] = await db.select(productSelect)
    .from(products)
    .leftJoin(inventory, eq(products.id, inventory.product_id))
    .leftJoin(categories, eq(products.category_id, categories.id))
    .where(and(eq(products.barcode, barcode), eq(products.is_active, true)))
    .limit(1);
  return row ?? null;
}

export async function findProductBySku(sku: string): Promise<Product | null> {
  const [row] = await db.select().from(products)
    .where(and(eq(products.sku, sku), eq(products.is_active, true)))
    .limit(1);
  return row ?? null;
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
  const [product] = await db.insert(products)
    .values({
      sku: data.sku,
      barcode: data.barcode,
      name: data.name,
      description: data.description,
      price: data.price,
      cost: data.cost,
      category_id: data.category_id,
      image_url: data.image_url,
    })
    .returning();

  await db.insert(inventory).values({ product_id: product.id, quantity: 0 });

  return product;
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
  const updates: Record<string, unknown> = {};
  if (data.sku !== undefined) updates.sku = data.sku;
  if (data.barcode !== undefined) updates.barcode = data.barcode;
  if (data.name !== undefined) updates.name = data.name;
  if (data.description !== undefined) updates.description = data.description;
  if (data.price !== undefined) updates.price = data.price;
  if (data.cost !== undefined) updates.cost = data.cost;
  if (data.category_id !== undefined) updates.category_id = data.category_id;
  if (data.image_url !== undefined) updates.image_url = data.image_url;

  if (Object.keys(updates).length === 0) return findProductById(id);

  const [row] = await db.update(products)
    .set(updates)
    .where(eq(products.id, id))
    .returning();
  return row ?? null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const result = await db.update(products)
    .set({ is_active: false })
    .where(eq(products.id, id))
    .returning({ id: products.id });
  return result.length > 0;
}
