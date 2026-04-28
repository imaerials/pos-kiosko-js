import * as categoryRepo from '../repositories/category.repository.js';
import { NotFoundError } from '../utils/errors.js';

export async function getAllCategories() {
  return categoryRepo.findAllCategories();
}

export async function getCategoryById(id: string) {
  const category = await categoryRepo.findCategoryById(id);
  if (!category) {
    throw new NotFoundError('Category');
  }
  return category;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order?: number;
}) {
  const existing = await categoryRepo.findCategoryBySlug(data.slug);
  if (existing) {
    throw new Error('Category with this slug already exists');
  }
  return categoryRepo.createCategory(data.name, data.slug, data.description, data.image_url, data.sort_order);
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string;
    image_url: string;
    sort_order: number;
  }>
) {
  const category = await categoryRepo.updateCategory(id, data);
  if (!category) {
    throw new NotFoundError('Category');
  }
  return category;
}
