import { and, eq, lte, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { inventory, products } from '../db/schema.js';
import type { Inventory } from '../types/index.js';

const inventoryWithProductSelect = {
  id: inventory.id,
  product_id: inventory.product_id,
  quantity: inventory.quantity,
  low_stock_threshold: inventory.low_stock_threshold,
  last_restocked_at: inventory.last_restocked_at,
  updated_at: inventory.updated_at,
  product_name: products.name,
  sku: products.sku,
};

export async function findInventoryByProductId(productId: string): Promise<Inventory | null> {
  const [row] = await db.select().from(inventory)
    .where(eq(inventory.product_id, productId))
    .limit(1);
  return row ?? null;
}

export async function findAllInventory(): Promise<(Inventory & { product_name: string; sku: string })[]> {
  return db.select(inventoryWithProductSelect)
    .from(inventory)
    .innerJoin(products, eq(inventory.product_id, products.id))
    .where(eq(products.is_active, true))
    .orderBy(inventory.quantity);
}

export async function findLowStockInventory(): Promise<(Inventory & { product_name: string; sku: string })[]> {
  return db.select(inventoryWithProductSelect)
    .from(inventory)
    .innerJoin(products, eq(inventory.product_id, products.id))
    .where(and(
      eq(products.is_active, true),
      lte(inventory.quantity, inventory.low_stock_threshold)
    ))
    .orderBy(inventory.quantity);
}

export async function updateInventory(
  productId: string,
  quantity: number,
  lowStockThreshold?: number
): Promise<Inventory | null> {
  const updates: Record<string, unknown> = {
    quantity,
    updated_at: new Date(),
  };
  if (lowStockThreshold !== undefined) updates.low_stock_threshold = lowStockThreshold;

  const [row] = await db.update(inventory)
    .set(updates)
    .where(eq(inventory.product_id, productId))
    .returning();
  return row ?? null;
}

export async function restockInventory(productId: string, quantity: number): Promise<Inventory | null> {
  const [row] = await db.update(inventory)
    .set({
      quantity: sql<number>`${inventory.quantity} + ${quantity}`,
      last_restocked_at: new Date(),
      updated_at: new Date(),
    })
    .where(eq(inventory.product_id, productId))
    .returning();
  return row ?? null;
}
