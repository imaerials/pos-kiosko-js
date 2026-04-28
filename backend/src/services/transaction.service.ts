import * as transactionRepo from '../repositories/transaction.repository.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

const TAX_RATE = 0.08;

export async function getAllTransactions(limit?: number, offset?: number, userId?: string) {
  return transactionRepo.findAllTransactions(limit, offset, userId);
}

export async function getTransactionById(id: string) {
  const transaction = await transactionRepo.findTransactionById(id);
  if (!transaction) {
    throw new NotFoundError('Transaction');
  }
  return transaction;
}

interface TransactionLineItem {
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
}

export async function createTransaction(
  lineItems: TransactionLineItem[],
  userId: string | undefined,
  paymentMethod: 'cash' | 'card' | 'mixed',
  amountPaid: number,
  discountAmount: number = 0,
  customerName?: string,
  notes?: string
) {
  if (!lineItems || lineItems.length === 0) {
    throw new ValidationError('Cannot checkout an empty cart');
  }

  const subtotal = lineItems.reduce(
    (sum, item) => sum + Number(item.unit_price) * item.quantity,
    0
  );
  const taxAmount = subtotal * TAX_RATE;
  const total = subtotal + taxAmount - discountAmount;

  if (amountPaid < total && paymentMethod === 'cash') {
    throw new ValidationError('Insufficient payment amount');
  }

  const changeGiven = paymentMethod === 'cash' ? amountPaid - total : 0;

  const transaction = await transactionRepo.createTransaction({
    userId,
    subtotal,
    taxAmount,
    discountAmount,
    total,
    paymentMethod,
    amountPaid,
    changeGiven,
    customerName,
    notes,
    items: lineItems.map(item => ({
      productId: item.product_id,
      productName: item.product_name,
      productSku: item.product_sku,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.unit_price) * item.quantity,
    })),
  });

  return transaction;
}

export async function refundTransaction(id: string) {
  const transaction = await transactionRepo.findTransactionById(id);
  if (!transaction) {
    throw new NotFoundError('Transaction');
  }

  if (transaction.status === 'refunded') {
    throw new ValidationError('Transaction already refunded');
  }

  if (transaction.status === 'voided') {
    throw new ValidationError('Cannot refund a voided transaction');
  }

  const updated = await transactionRepo.updateTransactionStatus(id, 'refunded');
  return updated;
}
