import { asc, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { categories } from '../db/schema.js';
import type { Category } from '../types/index.js';

export async function findAllCategories(): Promise<Category[]> {
  return db.select().from(categories)
    .where(eq(categories.is_active, true))
    .orderBy(asc(categories.sort_order), asc(categories.name));
}

export async function findCategoryById(id: string): Promise<Category | null> {
  const [row] = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return row ?? null;
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  const [row] = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return row ?? null;
}

export async function createCategory(
  name: string,
  slug: string,
  description?: string,
  imageUrl?: string,
  sortOrder?: number
): Promise<Category> {
  const [row] = await db.insert(categories)
    .values({ name, slug, description, image_url: imageUrl, sort_order: sortOrder ?? 0 })
    .returning();
  return row;
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; slug: string; description: string; image_url: string; sort_order: number }>
): Promise<Category | null> {
  const updates = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  ) as typeof data;

  if (Object.keys(updates).length === 0) return findCategoryById(id);

  const [row] = await db.update(categories)
    .set(updates)
    .where(eq(categories.id, id))
    .returning();
  return row ?? null;
}
