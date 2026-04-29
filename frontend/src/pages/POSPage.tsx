import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productsApi, categoriesApi, transactionsApi } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { ProductGrid } from '../components/products/ProductGrid';
import { CartPanel } from '../components/cart/CartPanel';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { ReceiptModal } from '../components/receipt/ReceiptModal';
import { toast } from 'react-hot-toast';
import type { Product, Transaction } from '../types';

export function POSPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { addItem, getTotal, clearCart, items } = useCartStore();

  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  const handleCheckoutComplete = async (paymentMethod: 'cash' | 'card', amountPaid: number) => {
    try {
      const transaction = await transactionsApi.create({
        payment_method: paymentMethod,
        amount_paid: paymentMethod === 'card' ? getTotal() : amountPaid,
        items: items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          quantity: item.quantity,
          unit_price: Number(item.unit_price),
        })),
      });

      setCompletedTransaction(transaction);
      clearCart();
      setCheckoutOpen(false);
      setReceiptOpen(true);
    } catch (error) {
      toast.error('Error al completar la transacción');
      console.error(error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-73px)]">
      <div className="flex-1 overflow-hidden">
        <ProductGrid
          products={products}
          categories={categories}
          onAddToCart={handleAddToCart}
        />
      </div>

      <div className="w-96 border-l">
        <CartPanel onCheckout={() => setCheckoutOpen(true)} />
      </div>

      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        total={getTotal()}
        onComplete={handleCheckoutComplete}
      />

      <ReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        transaction={completedTransaction}
      />
    </div>
  );
}
