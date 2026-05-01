import prisma from '../config/database.js';

export const categoryRepository = {
  async findAll({ page = 1, limit = 50 }: { page?: number; limit?: number } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.category.findMany({
        skip,
        take: limit,
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.category.count({ where: { isActive: true } }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findBySlug(slug: string) {
    return prisma.category.findUnique({ where: { slug } });
  },

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  async create(data: { name: string; slug: string; description?: string; imageUrl?: string; sortOrder?: number }) {
    return prisma.category.create({ data });
  },

  async update(id: string, data: { name?: string; description?: string; imageUrl?: string; sortOrder?: number; isActive?: boolean }) {
    return prisma.category.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.category.update({ where: { id }, data: { isActive: false } });
  },
};