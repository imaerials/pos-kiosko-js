import { ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { CartItemRow } from './CartItemRow';
import { useCartStore } from '../../store/cartStore';

interface CartPanelProps {
  onCheckout: () => void;
}

export function CartPanel({ onCheckout }: CartPanelProps) {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getTax, getTotal } = useCartStore();

  return (
    <div className="flex flex-col h-full bg-white border-l">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-gray-600" />
            <h2 className="text-lg font-semibold">Pedido actual</h2>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="p-1 text-gray-400 hover:text-red-500"
              title="Vaciar carrito"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{items.length} {items.length !== 1 ? 'ítems' : 'ítem'}</p>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
            <p>El carrito está vacío</p>
            <p className="text-sm mt-1">Agregá productos para comenzar</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))
        )}
      </div>

      <div className="border-t p-4 space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${getSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Impuesto (8%)</span>
            <span className="font-medium">${getTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t">
            <span>Total</span>
            <span className="text-blue-600">${getTotal().toFixed(2)}</span>
          </div>
        </div>

        <Button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full"
          size="lg"
        >
          Pagar ${getTotal().toFixed(2)}
        </Button>
      </div>
    </div>
  );
}
