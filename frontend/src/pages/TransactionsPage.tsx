import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionsApi } from '../services/api';
import { Modal } from '../components/ui/Modal';
import type { Transaction } from '../types';

function TransactionDetailModal({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  return (
    <Modal isOpen onClose={onClose} title={`Receipt ${transaction.receipt_number}`} size="lg">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <span className="text-gray-500">Date</span>
          <span>{new Date(transaction.created_at).toLocaleString()}</span>
          {transaction.user && (
            <>
              <span className="text-gray-500">Cashier</span>
              <span>{transaction.user.name}</span>
            </>
          )}
          {transaction.customer_name && (
            <>
              <span className="text-gray-500">Customer</span>
              <span>{transaction.customer_name}</span>
            </>
          )}
          <span className="text-gray-500">Status</span>
          <span className={`font-medium ${
            transaction.status === 'completed' ? 'text-gray-700' :
            transaction.status === 'refunded' ? 'text-orange-600' : 'text-red-600'
          }`}>
            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
          </span>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-500">Product</th>
                <th className="px-4 py-2 text-left font-medium text-gray-500">SKU</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Qty</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Unit price</th>
                <th className="px-4 py-2 text-right font-medium text-gray-500">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transaction.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2">{item.product_name}</td>
                  <td className="px-4 py-2 text-gray-500 font-mono">{item.product_sku}</td>
                  <td className="px-4 py-2 text-right">{item.quantity}</td>
                  <td className="px-4 py-2 text-right">${Number(item.unit_price).toFixed(2)}</td>
                  <td className="px-4 py-2 text-right">${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-1 text-sm pt-1">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>${Number(transaction.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Tax (8%)</span>
            <span>${Number(transaction.tax_amount).toFixed(2)}</span>
          </div>
          {Number(transaction.discount_amount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${Number(transaction.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t">
            <span>Total</span>
            <span className="text-blue-600">${Number(transaction.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t pt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment method</span>
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              transaction.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {transaction.payment_method.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount paid</span>
            <span>${Number(transaction.amount_paid).toFixed(2)}</span>
          </div>
          {Number(transaction.change_given) > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Change given</span>
              <span>${Number(transaction.change_given).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export function TransactionsPage() {
  const [selected, setSelected] = useState<Transaction | null>(null);

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionsApi.getAll(),
  });

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h2>

      {transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No transactions yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{tx.receipt_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(tx.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{tx.items.length}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">${Number(tx.total).toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tx.payment_method === 'cash' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {tx.payment_method.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      tx.status === 'completed' ? 'bg-gray-100 text-gray-700' :
                      tx.status === 'refunded' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => setSelected(tx)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <TransactionDetailModal transaction={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
