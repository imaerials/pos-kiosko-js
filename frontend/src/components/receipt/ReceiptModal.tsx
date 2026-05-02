import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Printer } from 'lucide-react';
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
    <Modal isOpen={isOpen} onClose={onClose} title="Recibo" size="sm">
      <div className="space-y-4" id="receipt-content">
        <div className="text-center border-b pb-4">
          <h3 className="text-lg font-bold">FlowPOS</h3>
          <p className="text-sm text-gray-500">¡Gracias por su compra!</p>
        </div>

        <div className="text-sm space-y-1">
          <p><span className="text-gray-500">Recibo #:</span> {transaction.receipt_number}</p>
          <p><span className="text-gray-500">Fecha:</span> {new Date(transaction.created_at).toLocaleString()}</p>
          {transaction.user && (
            <p><span className="text-gray-500">Cajero/a:</span> {transaction.user.name}</p>
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
            <span className="text-gray-600">Impuesto</span>
            <span>${Number(transaction.tax_amount).toFixed(2)}</span>
          </div>
          {Number(transaction.discount_amount) > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Descuento</span>
              <span>-${Number(transaction.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-blue-600">${Number(transaction.total).toFixed(2)}</span>
          </div>
        </div>

        <div className="text-sm space-y-1">
          <p><span className="text-gray-500">Pago:</span> {transaction.payment_method.toUpperCase()}</p>
          <p><span className="text-gray-500">Pagado:</span> ${Number(transaction.amount_paid).toFixed(2)}</p>
          {Number(transaction.change_given) > 0 && (
            <p><span className="text-gray-500">Vuelto:</span> ${Number(transaction.change_given).toFixed(2)}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="secondary" onClick={handlePrint} className="flex-1">
            <Printer size={18} className="mr-2" />
            Imprimir
          </Button>
          <Button onClick={onClose} className="flex-1">
            Listo
          </Button>
        </div>
      </div>
    </Modal>
  );
}
