import { cartRepository } from '../repositories/cartRepository.js';
import { transactionRepository } from '../repositories/transactionRepository.js';
import { inventoryRepository } from '../repositories/inventoryRepository.js';
import { config } from '../config/index.js';
import { CreateTransactionInput, RefundTransactionInput } from '../utils/validation.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${timestamp}-${random}`;
}

export const transactionService = {
  async getAll(page?: number, limit?: number, userId?: string, status?: string) {
    return transactionRepository.findAll({ page, limit, userId, status });
  },

  async getById(id: string) {
    const transaction = await transactionRepository.findById(id);
    if (!transaction) throw new NotFoundError('Transaction');
    return transaction;
  },

  async getByReceiptNumber(receiptNumber: string) {
    const transaction = await transactionRepository.findByReceiptNumber(receiptNumber);
    if (!transaction) throw new NotFoundError('Transaction');
    return transaction;
  },

  async create(userId: string | undefined, data: CreateTransactionInput) {
    const cart = await cartRepository.findById(data.cartId);
    if (!cart) throw new NotFoundError('Cart');
    if (!cart.items.length) throw new BadRequestError('Cart is empty');

    for (const item of cart.items) {
      const inventory = await inventoryRepository.findByProductId(item.productId);
      if (!inventory || inventory.quantity < item.quantity) {
        throw new BadRequestError(`Insufficient inventory for ${item.product.name}`);
      }
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const taxAmount = subtotal * config.taxRate;
    const discountAmount = data.discountAmount ?? 0;
    const total = subtotal + taxAmount - discountAmount;

    if (data.amountPaid < total) {
      throw new BadRequestError('Amount paid is less than total');
    }

    const changeGiven = data.amountPaid - total;

    const transaction = await transactionRepository.create({
      receiptNumber: generateReceiptNumber(),
      userId,
      subtotal,
      taxAmount,
      discountAmount,
      total,
      paymentMethod: data.paymentMethod,
      amountPaid: data.amountPaid,
      changeGiven,
      customerName: data.customerName,
      notes: data.notes,
      items: cart.items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        productSku: item.product.sku,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.unitPrice) * item.quantity,
      })),
    });

    await cartRepository.convertToTransaction(data.cartId);

    return transaction;
  },

  async refund(id: string, data: RefundTransactionInput, userRole: string) {
    if (userRole !== 'manager' && userRole !== 'admin') {
      throw new BadRequestError('Only managers can process refunds');
    }

    const transaction = await transactionRepository.findById(id);
    if (!transaction) throw new NotFoundError('Transaction');
    if (transaction.status === 'refunded') {
      throw new BadRequestError('Transaction already refunded');
    }

    return transactionRepository.refund(id, data.reason);
  },

  async getDailySales(date?: Date) {
    return transactionRepository.getDailySales(date);
  },
};