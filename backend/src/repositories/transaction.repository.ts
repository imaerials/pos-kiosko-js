import { and, desc, eq, ne, sql } from 'drizzle-orm';
import { db } from '../db/index.js';
import { inventory, transactionItems, transactions, users } from '../db/schema.js';
import type { Transaction, TransactionItem } from '../types/index.js';

export interface TransactionWithItems extends Transaction {
  items: TransactionItem[];
  user_name?: string | null;
}

export interface CreateTransactionData {
  userId?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'mixed';
  amountPaid: number;
  changeGiven?: number;
  customerName?: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    productSku: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
}

function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${timestamp}-${random}`;
}

const transactionSelect = {
  id: transactions.id,
  receipt_number: transactions.receipt_number,
  user_id: transactions.user_id,
  subtotal: transactions.subtotal,
  tax_amount: transactions.tax_amount,
  discount_amount: transactions.discount_amount,
  total: transactions.total,
  payment_method: transactions.payment_method,
  amount_paid: transactions.amount_paid,
  change_given: transactions.change_given,
  status: transactions.status,
  customer_name: transactions.customer_name,
  notes: transactions.notes,
  created_at: transactions.created_at,
  user_name: users.name,
};

export async function findAllTransactions(
  limit = 50,
  offset = 0,
  userId?: string
): Promise<TransactionWithItems[]> {
  const where = userId
    ? and(ne(transactions.status, 'voided'), eq(transactions.user_id, userId))
    : ne(transactions.status, 'voided');

  const txRows = await db.select(transactionSelect)
    .from(transactions)
    .leftJoin(users, eq(transactions.user_id, users.id))
    .where(where)
    .orderBy(desc(transactions.created_at))
    .limit(limit)
    .offset(offset);

  return Promise.all(txRows.map(async (tx) => {
    const items = await db.select().from(transactionItems)
      .where(eq(transactionItems.transaction_id, tx.id));
    return { ...tx, items };
  }));
}

export async function findTransactionById(id: string): Promise<TransactionWithItems | null> {
  const [tx] = await db.select(transactionSelect)
    .from(transactions)
    .leftJoin(users, eq(transactions.user_id, users.id))
    .where(eq(transactions.id, id))
    .limit(1);

  if (!tx) return null;

  const items = await db.select().from(transactionItems)
    .where(eq(transactionItems.transaction_id, id));

  return { ...tx, items };
}

export async function findTransactionByReceiptNumber(receiptNumber: string): Promise<TransactionWithItems | null> {
  const [tx] = await db.select().from(transactions)
    .where(eq(transactions.receipt_number, receiptNumber))
    .limit(1);

  if (!tx) return null;

  const items = await db.select().from(transactionItems)
    .where(eq(transactionItems.transaction_id, tx.id));

  return { ...tx, items };
}

export async function createTransaction(data: CreateTransactionData): Promise<TransactionWithItems> {
  return db.transaction(async (tx) => {
    const [transaction] = await tx.insert(transactions)
      .values({
        receipt_number: generateReceiptNumber(),
        user_id: data.userId,
        subtotal: data.subtotal,
        tax_amount: data.taxAmount,
        discount_amount: data.discountAmount ?? 0,
        total: data.total,
        payment_method: data.paymentMethod,
        amount_paid: data.amountPaid,
        change_given: data.changeGiven ?? 0,
        customer_name: data.customerName,
        notes: data.notes,
      })
      .returning();

    const items: TransactionItem[] = [];

    for (const item of data.items) {
      const [txItem] = await tx.insert(transactionItems)
        .values({
          transaction_id: transaction.id,
          product_id: item.productId,
          product_name: item.productName,
          product_sku: item.productSku,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          subtotal: item.subtotal,
        })
        .returning();
      items.push(txItem);
    }

    for (const item of data.items) {
      await tx.update(inventory)
        .set({
          quantity: sql<number>`${inventory.quantity} - ${item.quantity}`,
          updated_at: new Date(),
        })
        .where(eq(inventory.product_id, item.productId));
    }

    return { ...transaction, items };
  });
}

export async function updateTransactionStatus(
  id: string,
  status: 'completed' | 'refunded' | 'voided'
): Promise<Transaction | null> {
  const [row] = await db.update(transactions)
    .set({ status })
    .where(eq(transactions.id, id))
    .returning();
  return row ?? null;
}
