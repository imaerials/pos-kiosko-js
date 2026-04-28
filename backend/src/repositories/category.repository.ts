import { query } from '../config/database.js';
import { Category } from '../types/index.js';

export async function findAllCategories(): Promise<Category[]> {
  const result = await query<Category>(
    'SELECT * FROM categories WHERE is_active = true ORDER BY sort_order, name'
  );
  return result.rows;
}

export async function findCategoryById(id: string): Promise<Category | null> {
  const result = await query<Category>(
    'SELECT * FROM categories WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

export async function findCategoryBySlug(slug: string): Promise<Category | null> {
  const result = await query<Category>(
    'SELECT * FROM categories WHERE slug = $1',
    [slug]
  );
  return result.rows[0] || null;
}

export async function createCategory(
  name: string,
  slug: string,
  description?: string,
  imageUrl?: string,
  sortOrder?: number
): Promise<Category> {
  const result = await query<Category>(
    `INSERT INTO categories (name, slug, description, image_url, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [name, slug, description, imageUrl, sortOrder ?? 0]
  );
  return result.rows[0];
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; slug: string; description: string; image_url: string; sort_order: number }>
): Promise<Category | null> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    values.push(data.name);
  }
  if (data.slug !== undefined) {
    fields.push(`slug = $${paramIndex++}`);
    values.push(data.slug);
  }
  if (data.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(data.description);
  }
  if (data.image_url !== undefined) {
    fields.push(`image_url = $${paramIndex++}`);
    values.push(data.image_url);
  }
  if (data.sort_order !== undefined) {
    fields.push(`sort_order = $${paramIndex++}`);
    values.push(data.sort_order);
  }

  if (fields.length === 0) return findCategoryById(id);

  values.push(id);
  const result = await query<Category>(
    `UPDATE categories SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );
  return result.rows[0] || null;
}
