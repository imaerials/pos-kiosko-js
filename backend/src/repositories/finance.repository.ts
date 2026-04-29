import { query } from '../config/database.js';

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
    // 'today' — default: start of today
  }

  return { start, end };
}

export async function getFinanceSummary(period: string) {
  const { start, end } = getDateRange(period);
  const params = [start, end];

  const [salesRes, refundsRes, cogsRes, paymentRes, topRes, dailyRes] = await Promise.all([
    query(`
      SELECT
        COALESCE(SUM(total), 0)           AS revenue,
        COALESCE(SUM(tax_amount), 0)      AS tax_collected,
        COALESCE(SUM(discount_amount), 0) AS discounts_given,
        COUNT(*)                          AS transaction_count
      FROM transactions
      WHERE status = 'completed'
        AND created_at BETWEEN $1 AND $2
    `, params),

    query(`
      SELECT
        COALESCE(SUM(total), 0) AS refunds,
        COUNT(*)                AS refund_count
      FROM transactions
      WHERE status = 'refunded'
        AND created_at BETWEEN $1 AND $2
    `, params),

    query(`
      SELECT COALESCE(SUM(ti.quantity * COALESCE(p.cost, 0)), 0) AS cogs
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      LEFT JOIN products p ON ti.product_id = p.id
      WHERE t.status = 'completed'
        AND t.created_at BETWEEN $1 AND $2
    `, params),

    query(`
      SELECT
        payment_method,
        COALESCE(SUM(total), 0) AS amount,
        COUNT(*)                AS count
      FROM transactions
      WHERE status = 'completed'
        AND created_at BETWEEN $1 AND $2
      GROUP BY payment_method
    `, params),

    query(`
      SELECT
        ti.product_name,
        SUM(ti.quantity)  AS units_sold,
        SUM(ti.subtotal)  AS revenue
      FROM transaction_items ti
      JOIN transactions t ON ti.transaction_id = t.id
      WHERE t.status = 'completed'
        AND t.created_at BETWEEN $1 AND $2
      GROUP BY ti.product_name
      ORDER BY revenue DESC
      LIMIT 8
    `, params),

    query(`
      SELECT
        DATE(created_at)        AS date,
        COALESCE(SUM(total), 0) AS revenue,
        COUNT(*)                AS transactions
      FROM transactions
      WHERE status = 'completed'
        AND created_at BETWEEN $1 AND $2
      GROUP BY DATE(created_at)
      ORDER BY date
    `, params),
  ]);

  const sales   = salesRes.rows[0];
  const revenue = Number(sales.revenue);
  const refunds = Number(refundsRes.rows[0].refunds);
  const cogs    = Number(cogsRes.rows[0].cogs);
  const netRevenue = revenue - refunds;

  return {
    period,
    revenue,
    refunds,
    refund_count:     Number(refundsRes.rows[0].refund_count),
    net_revenue:      netRevenue,
    cogs,
    gross_profit:     netRevenue - cogs,
    tax_collected:    Number(sales.tax_collected),
    discounts_given:  Number(sales.discounts_given),
    transaction_count: Number(sales.transaction_count),
    avg_transaction:  Number(sales.transaction_count) > 0
      ? revenue / Number(sales.transaction_count)
      : 0,
    payment_methods: paymentRes.rows.map(r => ({
      method: r.payment_method as string,
      amount: Number(r.amount),
      count:  Number(r.count),
    })),
    top_products: topRes.rows.map(r => ({
      product_name: r.product_name as string,
      units_sold:   Number(r.units_sold),
      revenue:      Number(r.revenue),
    })),
    daily_revenue: dailyRes.rows.map(r => ({
      date:         r.date as string,
      revenue:      Number(r.revenue),
      transactions: Number(r.transactions),
    })),
  };
}
