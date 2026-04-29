import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CreditCard, Banknote } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
  onComplete: (paymentMethod: 'cash' | 'card', amountPaid: number) => void;
}

export function CheckoutModal({ isOpen, onClose, total, onComplete }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountPaid, setAmountPaid] = useState('');

  const parsedAmount = parseFloat(amountPaid) || 0;
  const changeDue = parsedAmount - total;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'cash' && parsedAmount < total) {
      alert('Monto insuficiente');
      return;
    }
    onComplete(paymentMethod, parsedAmount);
  };

  const quickAmounts = paymentMethod === 'cash' ? [
    Math.ceil(total),
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
  ].filter((v, i, a) => a.indexOf(v) === i && v >= total) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cobrar" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod('cash')}
            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
              paymentMethod === 'cash'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Banknote size={24} />
            <span className="font-medium">Efectivo</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-colors ${
              paymentMethod === 'card'
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard size={24} />
            <span className="font-medium">Tarjeta</span>
          </button>
        </div>

        {paymentMethod === 'cash' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montos rápidos</label>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setAmountPaid(amount.toString())}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Monto recibido"
              type="number"
              step="any"
              min={Math.ceil(total * 100) / 100}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder="0.00"
              required
            />

            {parsedAmount >= total && (
              <div className={`p-4 rounded-lg ${changeDue > 0 ? 'bg-green-50' : 'bg-gray-50'}`}>
                <p className="text-sm text-gray-600">Vuelto</p>
                <p className="text-2xl font-bold text-green-600">${changeDue.toFixed(2)}</p>
              </div>
            )}
          </>
        )}

        {paymentMethod === 'card' && (
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <CreditCard size={48} className="mx-auto mb-3 text-gray-400" />
            <p className="font-medium">Pago con tarjeta</p>
            <p className="text-sm text-gray-500 mt-1">El cliente debe acercar o insertar la tarjeta</p>
            <p className="text-lg font-bold mt-2">${total.toFixed(2)}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" className="flex-1" disabled={paymentMethod === 'cash' && parsedAmount < total}>
            Completar venta
          </Button>
        </div>
      </form>
    </Modal>
  );
}
