import prisma from '../config/database.js';
import { Role } from '@prisma/client';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: { email: string; passwordHash: string; name: string; role: Role }) {
    return prisma.user.create({ data });
  },

  async findAll({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
      }),
      prisma.user.count(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async update(id: string, data: { name?: string; role?: Role; isActive?: boolean }) {
    return prisma.user.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.user.delete({ where: { id } });
  },
};