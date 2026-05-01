import prisma from '../config/database.js';

function getPeriodStart(period: 'today' | 'week' | 'month' | 'year'): Date {
  const now = new Date();
  switch (period) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }
}

export const financeService = {
  async getSummary(period: 'today' | 'week' | 'month' | 'year') {
    const since = getPeriodStart(period);

    const [completed, refunded, dailyRows, topProductRows] = await Promise.all([
      prisma.transaction.findMany({
        where: { status: 'completed', createdAt: { gte: since } },
        include: { items: { include: { product: { select: { cost: true } } } } },
      }),
      prisma.transaction.aggregate({
        where: { status: 'refunded', createdAt: { gte: since } },
        _sum: { total: true },
        _count: true,
      }),
      prisma.$queryRaw<{ date: Date; revenue: number; transactions: bigint }[]>`
        SELECT
          DATE_TRUNC('day', created_at) AS date,
          SUM(total)::float                AS revenue,
          COUNT(*)                          AS transactions
        FROM transactions
        WHERE status = 'completed'
          AND created_at >= ${since}
        GROUP BY 1
        ORDER BY 1
      `,
      prisma.$queryRaw<{ product_name: string; units_sold: bigint; revenue: number }[]>`
        SELECT
          ti.product_name,
          SUM(ti.quantity)::bigint  AS units_sold,
          SUM(ti.subtotal)::float   AS revenue
        FROM transaction_items ti
        JOIN transactions t ON t.id = ti.transaction_id
        WHERE t.status = 'completed'
          AND t.created_at >= ${since}
        GROUP BY ti.product_name
        ORDER BY revenue DESC
        LIMIT 10
      `,
    ]);

    const revenue = completed.reduce((s, t) => s + Number(t.total), 0);
    const taxCollected = completed.reduce((s, t) => s + Number(t.taxAmount), 0);
    const discountsGiven = completed.reduce((s, t) => s + Number(t.discountAmount), 0);
    const cogs = completed.reduce((s, t) =>
      s + t.items.reduce((is, i) => is + Number(i.product?.cost ?? 0) * i.quantity, 0), 0);

    const refundsTotal = Number(refunded._sum.total ?? 0);
    const netRevenue = revenue - refundsTotal;
    const grossProfit = netRevenue - cogs;
    const transactionCount = completed.length;
    const avgTransaction = transactionCount > 0 ? revenue / transactionCount : 0;

    const paymentTotals: Record<string, { amount: number; count: number }> = {};
    for (const t of completed) {
      const m = t.paymentMethod;
      if (!paymentTotals[m]) paymentTotals[m] = { amount: 0, count: 0 };
      paymentTotals[m].amount += Number(t.total);
      paymentTotals[m].count += 1;
    }
    const paymentMethods = Object.entries(paymentTotals).map(([method, v]) => ({
      method,
      amount: v.amount,
      count: v.count,
    }));

    return {
      period,
      revenue,
      refunds: refundsTotal,
      refund_count: refunded._count,
      net_revenue: netRevenue,
      cogs,
      gross_profit: grossProfit,
      tax_collected: taxCollected,
      discounts_given: discountsGiven,
      transaction_count: transactionCount,
      avg_transaction: avgTransaction,
      payment_methods: paymentMethods,
      top_products: topProductRows.map(r => ({
        product_name: r.product_name,
        units_sold: Number(r.units_sold),
        revenue: Number(r.revenue),
      })),
      daily_revenue: dailyRows.map(r => ({
        date: r.date.toISOString().slice(0, 10),
        revenue: Number(r.revenue),
        transactions: Number(r.transactions),
      })),
    };
  },
};
