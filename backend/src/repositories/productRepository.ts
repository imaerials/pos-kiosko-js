import prisma from '../config/database.js';
import { Prisma } from '@prisma/client';

export const productRepository = {
  async findAll({ page = 1, limit = 50, categoryId }: { page?: number; limit?: number; categoryId?: string } = {}) {
    const skip = (page - 1) * limit;
    const where = { isActive: true, ...(categoryId && { categoryId }) };
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        where,
        include: { category: true, inventory: true },
        orderBy: { name: 'asc' },
      }),
      prisma.product.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findBySku(sku: string) {
    return prisma.product.findUnique({ where: { sku } });
  },

  async findByBarcode(barcode: string) {
    return prisma.product.findUnique({ where: { barcode } });
  },

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { category: true, inventory: true },
    });
  },

  async create(data: {
    sku: string;
    barcode?: string;
    name: string;
    description?: string;
    price: number;
    cost?: number;
    categoryId?: string;
    imageUrl?: string;
  }) {
    return prisma.product.create({ data });
  },

  async update(id: string, data: {
    sku?: string;
    barcode?: string;
    name?: string;
    description?: string;
    price?: number;
    cost?: number;
    categoryId?: string;
    imageUrl?: string;
    isActive?: boolean;
  }) {
    return prisma.product.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.product.update({ where: { id }, data: { isActive: false } });
  },

  async search(query: string, { page = 1, limit = 20 }: { page?: number; limit?: number } = {}) {
    const skip = (page - 1) * limit;
    const where = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } as Prisma.StringFilter },
        { sku: { contains: query } as Prisma.StringFilter },
        { barcode: { contains: query } as Prisma.StringFilter },
      ],
    };
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        where,
        include: { category: true, inventory: true },
      }),
      prisma.product.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },
};