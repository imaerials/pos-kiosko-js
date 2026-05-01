import { categoryRepository } from '../repositories/categoryRepository.js';
import { CreateCategoryInput, UpdateCategoryInput } from '../utils/validation.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const categoryService = {
  async getAll() {
    return categoryRepository.findAll({});
  },

  async getById(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category');
    return category;
  },

  async getBySlug(slug: string) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw new NotFoundError('Category');
    return category;
  },

  async create(data: CreateCategoryInput) {
    const existing = await categoryRepository.findBySlug(data.slug);
    if (existing) throw new BadRequestError('Slug already exists');

    return categoryRepository.create(data);
  },

  async update(id: string, data: UpdateCategoryInput) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category');

    if (data.slug && data.slug !== category.slug) {
      const existing = await categoryRepository.findBySlug(data.slug);
      if (existing) throw new BadRequestError('Slug already exists');
    }

    return categoryRepository.update(id, data);
  },

  async delete(id: string) {
    const category = await categoryRepository.findById(id);
    if (!category) throw new NotFoundError('Category');
    return categoryRepository.delete(id);
  },
};