import { transactionRepository } from '../repositories/transactionRepository.js';
import { inventoryRepository } from '../repositories/inventoryRepository.js';
import { config } from '../config/index.js';
import { CreateTransactionInput, RefundTransactionInput } from '../utils/validation.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { createQRPayment } from './mercadoPagoService.js';

function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${timestamp}-${random}`;
}

type PrismaTransaction = NonNullable<Awaited<ReturnType<typeof transactionRepository.findById>>>;

function mapTransaction(t: PrismaTransaction) {
  return {
    id: t.id,
    receipt_number: t.receiptNumber,
    subtotal: Number(t.subtotal),
    tax_amount: Number(t.taxAmount),
    discount_amount: Number(t.discountAmount),
    total: Number(t.total),
    payment_method: t.paymentMethod,
    amount_paid: Number(t.amountPaid),
    change_given: Number(t.changeGiven),
    status: t.status,
    customer_name: t.customerName ?? null,
    notes: t.notes ?? null,
    created_at: t.createdAt.toISOString(),
    user: t.user ? { name: t.user.name } : undefined,
    items: t.items.map(i => ({
      id: i.id,
      transaction_id: i.transactionId,
      product_id: i.productId ?? null,
      product_name: i.productName,
      product_sku: i.productSku,
      quantity: i.quantity,
      unit_price: Number(i.unitPrice),
      subtotal: Number(i.subtotal),
    })),
  };
}

export const transactionService = {
  async getAll(page?: number, limit?: number, userId?: string, status?: string) {
    const result = await transactionRepository.findAll({ page, limit, userId, status });
    return { ...result, items: result.items.map(mapTransaction) };
  },

  async getById(id: string) {
    const transaction = await transactionRepository.findById(id);
    if (!transaction) throw new NotFoundError('Transaction');
    return mapTransaction(transaction);
  },

  async getByReceiptNumber(receiptNumber: string) {
    const transaction = await transactionRepository.findByReceiptNumber(receiptNumber);
    if (!transaction) throw new NotFoundError('Transaction');
    return mapTransaction(transaction);
  },

  async create(userId: string | undefined, data: CreateTransactionInput) {
    for (const item of data.items) {
      const inventory = await inventoryRepository.findByProductId(item.product_id);
      if (!inventory || inventory.quantity < item.quantity) {
        throw new BadRequestError(`Insufficient inventory for ${item.product_name}`);
      }
    }

    const subtotal = data.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const taxAmount = subtotal * config.taxRate;
    const discountAmount = data.discount_amount ?? 0;
    const total = subtotal + taxAmount - discountAmount;
    const receiptNumber = generateReceiptNumber();

    // Cash payment - synchronous completion
    if (data.payment_method === 'cash') {
      if (data.amount_paid < total) {
        throw new BadRequestError('Amount paid is less than total');
      }
      const changeGiven = data.amount_paid - total;

      const transaction = await transactionRepository.create({
        receiptNumber,
        userId,
        subtotal,
        taxAmount,
        discountAmount,
        total,
        paymentMethod: 'cash',
        amountPaid: data.amount_paid,
        changeGiven,
        customerName: data.customer_name,
        notes: data.notes,
        items: data.items.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.unit_price * item.quantity,
        })),
      });

      if (!transaction) throw new BadRequestError('Failed to create transaction');
      return mapTransaction(transaction);
    }

    // Card payment - async with Mercado Pago QR
    if (data.payment_method === 'card') {
      const changeGiven = 0;

      // Create transaction in pending state first
      const transaction = await transactionRepository.create({
        receiptNumber,
        userId,
        subtotal,
        taxAmount,
        discountAmount,
        total,
        paymentMethod: 'card',
        amountPaid: total,
        changeGiven,
        status: 'pending_payment',
        customerName: data.customer_name,
        notes: data.notes,
        items: data.items.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.unit_price * item.quantity,
        })),
      });

      if (!transaction) throw new BadRequestError('Failed to create transaction');

      // Initiate Mercado Pago QR payment
      try {
        const preferenceItems = data.items.map(item => ({
          title: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
        }));
        const qrResult = await createQRPayment(
          total,
          receiptNumber,
          `FlowPOS Sale ${receiptNumber}`,
          preferenceItems
        );

        await transactionRepository.updateMercadoPago(transaction.id, {
          mercadoPagoPaymentId: qrResult.paymentId,
          mercadoPagoQrData: qrResult.qrData,
          mercadoPagoStatus: 'pending',
        });

        const mapped = mapTransaction(transaction);
        return {
          ...mapped,
          payment_pending: true,
          qr_data: qrResult.qrData,
          qr_image_url: qrResult.qrImageUrl,
          payment_id: qrResult.paymentId,
        };
      } catch (error) {
        // Rollback: delete pending transaction
        await transactionRepository.delete(transaction.id);
        throw new BadRequestError('Failed to initiate card payment. Please try again.');
      }
    }

    // Mixed payment - similar to card (QR for card portion)
    if (data.payment_method === 'mixed') {
      const changeGiven = data.amount_paid >= total ? data.amount_paid - total : 0;

      const transaction = await transactionRepository.create({
        receiptNumber,
        userId,
        subtotal,
        taxAmount,
        discountAmount,
        total,
        paymentMethod: 'mixed',
        amountPaid: data.amount_paid,
        changeGiven,
        customerName: data.customer_name,
        notes: data.notes,
        items: data.items.map(item => ({
          productId: item.product_id,
          productName: item.product_name,
          productSku: item.product_sku,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          subtotal: item.unit_price * item.quantity,
        })),
      });

      if (!transaction) throw new BadRequestError('Failed to create transaction');
      return mapTransaction(transaction);
    }

    throw new BadRequestError('Invalid payment method');
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

    const refunded = await transactionRepository.refund(id, data.reason);
    if (!refunded) throw new NotFoundError('Transaction');
    return mapTransaction(refunded);
  },

  async getDailySales(date?: Date) {
    return transactionRepository.getDailySales(date);
  },
};
