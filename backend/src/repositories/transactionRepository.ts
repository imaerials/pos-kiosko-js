import prisma from '../config/database.js';

export const transactionRepository = {
  async findAll({ page = 1, limit = 20, userId, status }: { page?: number; limit?: number; userId?: string; status?: string } = {}) {
    const skip = (page - 1) * limit;
    const where = { ...(userId && { userId }), ...(status && { status: status as 'completed' | 'pending_payment' | 'refunded' | 'voided' }) };
    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        skip,
        take: limit,
        where,
        include: { user: { select: { id: true, name: true, email: true } }, items: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.transaction.count({ where }),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id: string) {
    return prisma.transaction.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } }, items: true },
    });
  },

  async findByReceiptNumber(receiptNumber: string) {
    return prisma.transaction.findUnique({
      where: { receiptNumber },
      include: { user: { select: { id: true, name: true, email: true } }, items: true },
    });
  },

  async create(data: {
    receiptNumber: string;
    userId?: string;
    subtotal: number;
    taxAmount: number;
    discountAmount?: number;
    total: number;
    paymentMethod: 'cash' | 'card' | 'mixed';
    amountPaid: number;
    changeGiven?: number;
    status?: 'completed' | 'pending_payment' | 'refunded' | 'voided';
    customerName?: string;
    notes?: string;
    items: { productId: string; productName: string; productSku: string; quantity: number; unitPrice: number; subtotal: number }[];
  }) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          receiptNumber: data.receiptNumber,
          userId: data.userId,
          subtotal: data.subtotal,
          taxAmount: data.taxAmount,
          discountAmount: data.discountAmount ?? 0,
          total: data.total,
          paymentMethod: data.paymentMethod,
          amountPaid: data.amountPaid,
          changeGiven: data.changeGiven ?? 0,
          status: data.status ?? 'completed',
          customerName: data.customerName,
          notes: data.notes,
        },
      });

      await tx.transactionItem.createMany({
        data: data.items.map(item => ({
          transactionId: transaction.id,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
      });

      for (const item of data.items) {
        if (item.productId) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { decrement: item.quantity } },
          });
        }
      }

      return tx.transaction.findUnique({
        where: { id: transaction.id },
        include: { user: { select: { id: true, name: true, email: true } }, items: true },
      });
    });
  },

  async refund(id: string, reason?: string) {
    return prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.update({
        where: { id },
        data: { status: 'refunded' },
      });

      const items = await tx.transactionItem.findMany({ where: { transactionId: id } });

      for (const item of items) {
        if (item.productId) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }

      if (reason) {
        await tx.transaction.update({
          where: { id },
          data: { notes: `${transaction.notes ? transaction.notes + '; ' : ''}Refunded: ${reason}` },
        });
      }

      return tx.transaction.findUnique({
        where: { id },
        include: { user: { select: { id: true, name: true, email: true } }, items: true },
      });
    });
  },

  async getDailySales(date: Date = new Date()) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [transactions, summary] = await Promise.all([
      prisma.transaction.findMany({
        where: { createdAt: { gte: startOfDay, lte: endOfDay }, status: 'completed' },
        include: { items: true },
      }),
      prisma.transaction.aggregate({
        where: { createdAt: { gte: startOfDay, lte: endOfDay }, status: 'completed' },
        _sum: { total: true, taxAmount: true },
        _count: true,
      }),
    ]);

    return { transactions, summary };
  },

  async updateMercadoPago(id: string, data: {
    mercadoPagoPaymentId?: string;
    mercadoPagoQrData?: string;
    mercadoPagoStatus?: string;
  }) {
    return prisma.transaction.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.transaction.delete({
      where: { id },
    });
  },
};