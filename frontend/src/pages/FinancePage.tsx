import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp, TrendingDown, DollarSign, ReceiptText,
  ShoppingCart, BarChart3, CreditCard, Banknote, RefreshCw,
} from 'lucide-react';
import { financeApi } from '../services/api';

type Period = 'today' | 'week' | 'month' | 'year';

const PERIODS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week',  label: 'Last 7 days' },
  { key: 'month', label: 'Last 30 days' },
  { key: 'year',  label: 'Last 365 days' },
];

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function KpiCard({
  label, value, sub, icon, color, positive,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  positive?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${positive === false ? 'text-red-600' : positive === true ? 'text-green-600' : 'text-gray-900'}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number; sub?: string }[] }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-36 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <div
            className="w-full bg-blue-500 rounded-t-sm transition-all"
            style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
            title={`${d.label}: ${fmt(d.value)}`}
          />
          <span className="text-[10px] text-gray-400 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function FinancePage() {
  const [period, setPeriod] = useState<Period>('month');

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['finance', period],
    queryFn: () => financeApi.getSummary(period),
  });

  const dailyChartData = (data?.daily_revenue ?? []).map(d => ({
    label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: d.revenue,
  }));

  const totalPayments = data?.payment_methods.reduce((s, p) => s + p.amount, 0) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Finance</h2>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border bg-white overflow-hidden text-sm">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-4 py-2 font-medium transition-colors ${
                  period === p.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : !data ? null : (
        <>
          {/* Income KPIs */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Income</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Gross Revenue"
                value={fmt(data.revenue)}
                sub={`${data.transaction_count} transactions`}
                icon={<TrendingUp size={20} className="text-white" />}
                color="bg-blue-500"
                positive
              />
              <KpiCard
                label="Net Revenue"
                value={fmt(data.net_revenue)}
                sub={`After ${data.refund_count} refund(s)`}
                icon={<DollarSign size={20} className="text-white" />}
                color="bg-green-500"
                positive
              />
              <KpiCard
                label="Gross Profit"
                value={fmt(data.gross_profit)}
                sub="Net revenue − COGS"
                icon={<BarChart3 size={20} className="text-white" />}
                color={data.gross_profit >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
                positive={data.gross_profit >= 0}
              />
              <KpiCard
                label="Avg. Transaction"
                value={fmt(data.avg_transaction)}
                sub="Per completed sale"
                icon={<ShoppingCart size={20} className="text-white" />}
                color="bg-purple-500"
              />
            </div>
          </div>

          {/* Outcome KPIs */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Outcomes</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Cost of Goods Sold"
                value={fmt(data.cogs)}
                sub="Based on product cost"
                icon={<TrendingDown size={20} className="text-white" />}
                color="bg-orange-500"
                positive={false}
              />
              <KpiCard
                label="Refunds"
                value={fmt(data.refunds)}
                sub={`${data.refund_count} transaction(s)`}
                icon={<RefreshCw size={20} className="text-white" />}
                color="bg-red-500"
                positive={false}
              />
              <KpiCard
                label="Tax Collected"
                value={fmt(data.tax_collected)}
                sub="8% sales tax"
                icon={<ReceiptText size={20} className="text-white" />}
                color="bg-yellow-500"
              />
              <KpiCard
                label="Discounts Given"
                value={fmt(data.discounts_given)}
                sub="Total discount amount"
                icon={<TrendingDown size={20} className="text-white" />}
                color="bg-pink-500"
                positive={false}
              />
            </div>
          </div>

          {/* Charts & Tables row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily revenue chart */}
            <div className="lg:col-span-2 bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Revenue over time</h3>
              {dailyChartData.length === 0 ? (
                <div className="h-36 flex items-center justify-center text-gray-400 text-sm">
                  No data for this period
                </div>
              ) : (
                <BarChart data={dailyChartData} />
              )}
            </div>

            {/* Payment methods */}
            <div className="bg-white rounded-xl border p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Payment methods</h3>
              {data.payment_methods.length === 0 ? (
                <p className="text-sm text-gray-400">No data</p>
              ) : (
                <div className="space-y-3">
                  {data.payment_methods.map(pm => {
                    const pct = totalPayments > 0 ? (pm.amount / totalPayments) * 100 : 0;
                    const icon = pm.method === 'cash'
                      ? <Banknote size={16} className="text-green-600" />
                      : <CreditCard size={16} className="text-blue-600" />;
                    return (
                      <div key={pm.method}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="flex items-center gap-1.5 font-medium text-gray-700 capitalize">
                            {icon} {pm.method}
                          </span>
                          <span className="text-gray-500">{fmt(pm.amount)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pm.method === 'cash' ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{pm.count} transaction(s) · {pct.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top products */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Top products by revenue</h3>
            </div>
            {data.top_products.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400">No sales in this period</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">#</th>
                    <th className="px-5 py-3 text-left font-medium text-gray-500">Product</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Units sold</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Revenue</th>
                    <th className="px-5 py-3 text-right font-medium text-gray-500">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.top_products.map((p, i) => {
                    const share = data.revenue > 0 ? (p.revenue / data.revenue) * 100 : 0;
                    return (
                      <tr key={p.product_name} className="hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-5 py-3 font-medium text-gray-800">{p.product_name}</td>
                        <td className="px-5 py-3 text-right text-gray-600">{p.units_sold}</td>
                        <td className="px-5 py-3 text-right font-medium">{fmt(p.revenue)}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${share}%` }} />
                            </div>
                            <span className="text-gray-400 w-10 text-right">{share.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
