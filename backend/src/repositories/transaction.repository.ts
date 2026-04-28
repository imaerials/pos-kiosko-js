import { query, getClient } from '../config/database.js';
import { Transaction, TransactionItem } from '../types/index.js';

export interface TransactionWithItems extends Transaction {
  items: TransactionItem[];
}

export async function findAllTransactions(
  limit: number = 50,
  offset: number = 0,
  userId?: string
): Promise<TransactionWithItems[]> {
  let sql = `
    SELECT t.*, u.name as user_name
    FROM transactions t
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.status != 'voided'
  `;
  const params: any[] = [];

  if (userId) {
    sql += ` AND t.user_id = $${params.length + 1}`;
    params.push(userId);
  }

  sql += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const transactionResult = await query<Transaction & { user_name: string }>(sql, params);

  const transactions: TransactionWithItems[] = [];

  for (const tx of transactionResult.rows) {
    const itemsResult = await query<TransactionItem>(
      'SELECT * FROM transaction_items WHERE transaction_id = $1',
      [tx.id]
    );
    transactions.push({
      ...tx,
      user_name: tx.user_name,
      items: itemsResult.rows,
    } as TransactionWithItems);
  }

  return transactions;
}

export async function findTransactionById(id: string): Promise<TransactionWithItems | null> {
  const txResult = await query<Transaction & { user_name: string }>(
    `SELECT t.*, u.name as user_name
     FROM transactions t
     LEFT JOIN users u ON t.user_id = u.id
     WHERE t.id = $1`,
    [id]
  );

  if (txResult.rows.length === 0) return null;

  const itemsResult = await query<TransactionItem>(
    'SELECT * FROM transaction_items WHERE transaction_id = $1',
    [id]
  );

  return {
    ...txResult.rows[0],
    items: itemsResult.rows,
  } as TransactionWithItems;
}

export async function findTransactionByReceiptNumber(receiptNumber: string): Promise<TransactionWithItems | null> {
  const txResult = await query<Transaction>(
    'SELECT * FROM transactions WHERE receipt_number = $1',
    [receiptNumber]
  );

  if (txResult.rows.length === 0) return null;

  const itemsResult = await query<TransactionItem>(
    'SELECT * FROM transaction_items WHERE transaction_id = $1',
    [txResult.rows[0].id]
  );

  return {
    ...txResult.rows[0],
    items: itemsResult.rows,
  } as TransactionWithItems;
}

function generateReceiptNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RCP-${timestamp}-${random}`;
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

export async function createTransaction(data: CreateTransactionData): Promise<TransactionWithItems> {
  const client = await getClient();
  const receiptNumber = generateReceiptNumber();

  try {
    await client.query('BEGIN');

    const txResult = await client.query<Transaction>(
      `INSERT INTO transactions
       (receipt_number, user_id, subtotal, tax_amount, discount_amount, total,
        payment_method, amount_paid, change_given, customer_name, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        receiptNumber,
        data.userId,
        data.subtotal,
        data.taxAmount,
        data.discountAmount ?? 0,
        data.total,
        data.paymentMethod,
        data.amountPaid,
        data.changeGiven ?? 0,
        data.customerName,
        data.notes,
      ]
    );

    const transaction = txResult.rows[0];
    const items: TransactionItem[] = [];

    for (const item of data.items) {
      const itemResult = await client.query<TransactionItem>(
        `INSERT INTO transaction_items
         (transaction_id, product_id, product_name, product_sku, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          transaction.id,
          item.productId,
          item.productName,
          item.productSku,
          item.quantity,
          item.unitPrice,
          item.subtotal,
        ]
      );
      items.push(itemResult.rows[0]);
    }

    for (const item of data.items) {
      await client.query(
        'UPDATE inventory SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP WHERE product_id = $2',
        [item.quantity, item.productId]
      );
    }

    await client.query('COMMIT');

    return {
      ...transaction,
      items,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateTransactionStatus(
  id: string,
  status: 'completed' | 'refunded' | 'voided'
): Promise<Transaction | null> {
  const result = await query<Transaction>(
    'UPDATE transactions SET status = $1 WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0] || null;
}
