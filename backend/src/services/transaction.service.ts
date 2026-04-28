import * as transactionRepo from '../repositories/transaction.repository.js';
import * as cartRepo from '../repositories/cart.repository.js';
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

export async function createTransaction(
  cartId: string,
  userId: string | undefined,
  paymentMethod: 'cash' | 'card' | 'mixed',
  amountPaid: number,
  discountAmount: number = 0,
  customerName?: string,
  notes?: string
) {
  const cart = await cartRepo.findCartById(cartId);
  if (!cart) {
    throw new NotFoundError('Cart');
  }

  if (cart.items.length === 0) {
    throw new ValidationError('Cannot checkout an empty cart');
  }

  const subtotal = cart.items.reduce(
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
    items: cart.items.map(item => ({
      productId: item.product_id,
      productName: (item as any).product_name || 'Unknown',
      productSku: (item as any).product_sku || 'UNKNOWN',
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.unit_price) * item.quantity,
    })),
  });

  await cartRepo.convertCartToTransaction(cartId);

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
