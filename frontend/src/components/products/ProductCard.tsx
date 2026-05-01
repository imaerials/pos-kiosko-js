import { Plus } from 'lucide-react';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-3 sm:p-4 hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
        <span className="text-3xl sm:text-4xl text-gray-400">
          {product.category_slug === 'produce' && '🥬'}
          {product.category_slug === 'dairy' && '🥛'}
          {product.category_slug === 'bakery' && '🍞'}
          {product.category_slug === 'beverages' && '🥤'}
          {product.category_slug === 'snacks' && '🍿'}
          {!product.category_slug && '📦'}
        </span>
      </div>
      <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
      <p className="text-xs text-gray-500 mb-2 truncate">{product.sku}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-base sm:text-lg font-bold text-blue-600 truncate">${Number(product.price).toFixed(2)}</span>
        <button
          onClick={() => onAdd(product)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shrink-0"
          aria-label="Agregar al carrito"
        >
          <Plus size={18} />
        </button>
      </div>
      {product.quantity !== undefined && product.quantity < 20 && (
        <p className="text-xs text-orange-500 mt-2">Stock bajo: quedan {product.quantity}</p>
      )}
    </div>
  );
}
