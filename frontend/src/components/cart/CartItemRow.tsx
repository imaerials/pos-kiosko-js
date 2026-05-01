import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../types';

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 py-3 border-b last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{item.product_name}</p>
        <p className="text-xs sm:text-sm text-gray-500">${Number(item.unit_price).toFixed(2)} c/u</p>
        <p className="text-sm font-medium text-gray-900 sm:hidden mt-0.5">
          ${(Number(item.unit_price) * item.quantity).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          aria-label="Disminuir"
        >
          <Minus size={16} />
        </button>
        <span className="w-7 sm:w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
          aria-label="Aumentar"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="hidden sm:block w-20 text-right font-medium">
        ${(Number(item.unit_price) * item.quantity).toFixed(2)}
      </div>

      <button
        onClick={() => onRemove(item.id)}
        className="p-2 rounded hover:bg-red-100 text-red-500 shrink-0"
        aria-label="Eliminar"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
