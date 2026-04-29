import { sql } from 'drizzle-orm';
import { db } from '../db/index.js';

function getDateRange(period: string): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case 'week':  start.setDate(now.getDate() - 6);   break;
    case 'month': start.setDate(now.getDate() - 29);  break;
    case 'year':  start.setDate(now.getDate() - 364); break;
  }

  return { start, end };
}

export async function getFinanceSummary(period: string) {
  const { start, end } = getDateRange(period);

  const [salesRes, refundsRes, cogsRes, paymentRes, topRes, dailyRes] = await Promise.all([
    db.execute(sql`
      SELECT
        COALESCE(SUM(total), 0)           AS revenue,
        COALESCE(SUM(tax_amount), 0)      AS tax_collected,
        COALESCE(SUM(discount_amount), 0) AS discounts_given,
        COUNT(*)                          AS transaction_count
      FROM transactions
      WHERE status = 'completed'
        AND created_at BETWEEN ${start} AND ${end}
    `),

    db.execute(sql`
      SELECT
        COALESCE(SUM(total), 0) AS refunds,
        COUNT(*)                AS refund_count
      FROM transactions
      WHERE status = 'refunded'
        AND created_at BETWEEN ${start} AND ${end}
    `),

    db.execute(sql`
      SELECT COALESCE(SUM(ti.quantity * COALESCE(p.cost, 0)), 0) AS cogs
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      LEFT JOIN products p ON ti.product_id = p.id
      WHERE t.status = 'completed'
        AND t.created_at BETWEEN ${start} AND ${end}
    `),

    db.execute(sql`
      SELECT
        payment_method,
        COALESCE(SUM(total), 0) AS amount,
        COUNT(*)                AS count
      FROM transactions
      WHERE status = 'completed'
        AND created_at BETWEEN ${start} AND ${end}
      GROUP BY payment_method
    `),

    db.execute(sql`
      SELECT
        ti.product_name,
        SUM(ti.quantity)  AS units_sold,
        SUM(ti.subtotal)  AS revenue
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.status = 'completed'
        AND t.created_at BETWEEN ${start} AND ${end}
      GROUP BY ti.product_name
      ORDER BY revenue DESC
      LIMIT 8
    `),

    db.execute(sql`
      SELECT
        DATE(created_at)        AS date,
        COALESCE(SUM(total), 0) AS revenue,
        COUNT(*)                AS transactions
      FROM transactions
      WHERE status = 'completed'
        AND created_at BETWEEN ${start} AND ${end}
      GROUP BY DATE(created_at)
      ORDER BY date
    `),
  ]);

  type SalesRow    = { revenue: string; tax_collected: string; discounts_given: string; transaction_count: string };
  type RefundRow   = { refunds: string; refund_count: string };
  type CogsRow     = { cogs: string };
  type PaymentRow  = { payment_method: string; amount: string; count: string };
  type TopRow      = { product_name: string; units_sold: string; revenue: string };
  type DailyRow    = { date: string; revenue: string; transactions: string };

  const sales     = salesRes.rows[0] as SalesRow;
  const revenue   = Number(sales.revenue);
  const refunds   = Number((refundsRes.rows[0] as RefundRow).refunds);
  const cogs      = Number((cogsRes.rows[0] as CogsRow).cogs);
  const netRevenue = revenue - refunds;

  return {
    period,
    revenue,
    refunds,
    refund_count:      Number((refundsRes.rows[0] as RefundRow).refund_count),
    net_revenue:       netRevenue,
    cogs,
    gross_profit:      netRevenue - cogs,
    tax_collected:     Number(sales.tax_collected),
    discounts_given:   Number(sales.discounts_given),
    transaction_count: Number(sales.transaction_count),
    avg_transaction:   Number(sales.transaction_count) > 0
      ? revenue / Number(sales.transaction_count)
      : 0,
    payment_methods: (paymentRes.rows as PaymentRow[]).map(r => ({
      method: r.payment_method,
      amount: Number(r.amount),
      count:  Number(r.count),
    })),
    top_products: (topRes.rows as TopRow[]).map(r => ({
      product_name: r.product_name,
      units_sold:   Number(r.units_sold),
      revenue:      Number(r.revenue),
    })),
    daily_revenue: (dailyRes.rows as DailyRow[]).map(r => ({
      date:         r.date,
      revenue:      Number(r.revenue),
      transactions: Number(r.transactions),
    })),
  };
}
