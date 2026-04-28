import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer, X } from 'lucide-react';
import type { Transaction } from '../../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
}

export function ReceiptModal({ isOpen, onClose, transaction }: ReceiptModalProps) {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt" size="sm">
      <div className="space-y-4" id="receipt-content">
        <div className="text-center border-b pb-4">
          <h3 className="text-lg font-bold">Grocery POS</h3>
          <p className="text-sm text-gray-500">Thank you for shopping with us!</p>
        </div>

        <div className="text-sm space-y-1">
          <p><span className="text-gray-500">Receipt #:</span> {transaction.receipt_number}</p>
          <p><span className="text-gray-500">Date:</span> {new Date(transaction.created_at).toLocaleString()}</p>
          {transaction.user && (
            <p><span className="text-gray-500">Cashier:</span> {transaction.user.name}</p>
          )}
        </div>

        <div className="border-t border-b py-4 space-y-2">
          {transaction.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.product_name}</span>
              <span>${Number(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${Number(transaction.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>${Number(transaction.tax_amount).toFixed(2)}</span>
          </div>
          {Number(transaction.discount_amount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-${Number(transaction.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-blue-600">${Number(transaction.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="text-sm space-y-1">
          <p><span className="text-gray-500">Payment:</span> {transaction.payment_method.toUpperCase()}</p>
          <p><span className="text-gray-500">Paid:</span> ${Number(transaction.amount_paid).toFixed(2)}</p>
          {Number(transaction.change_given) > 0 && (
            <p><span className="text-gray-500">Change:</span> ${Number(transaction.change_given).toFixed(2)}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={handlePrint} className="flex-1">
            <Printer size={18} className="mr-2" />
            Print
          </Button>
          <Button onClick={onClose} className="flex-1">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
