import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, X, QrCode, Loader2 } from 'lucide-react';
import { productsApi, categoriesApi, transactionsApi } from '../services/api';
import { useCartStore } from '../store/cartStore';
import { ProductGrid } from '../components/products/ProductGrid';
import { CartPanel } from '../components/cart/CartPanel';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { ReceiptModal } from '../components/receipt/ReceiptModal';
import { Modal } from '../components/ui/Modal';
import { toast } from 'react-hot-toast';
import type { Product, Transaction } from '../types';

export function POSPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState<{ qr_data?: string; qr_image_url?: string; payment_id?: string } | null>(null);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);

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
      const transaction: any = await transactionsApi.create({
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

      // Card payment with pending Mercado Pago QR
      if (transaction.payment_pending && transaction.qr_data) {
        setQrData(transaction);
        setPendingTransactionId(transaction.id);
        setCheckoutOpen(false);
        setQrModalOpen(true);
        return;
      }

      // Cash payment - complete immediately
      setCompletedTransaction(transaction);
      clearCart();
      setCheckoutOpen(false);
      setMobileCartOpen(false);
      setReceiptOpen(true);
    } catch (error) {
      toast.error('Error al completar la transacción');
      console.error(error);
    }
  };

  // Poll for payment confirmation when QR is displayed
  useEffect(() => {
    if (!pendingTransactionId || !qrModalOpen) return;

    const pollPayment = async () => {
      try {
        const transaction = await transactionsApi.getById(pendingTransactionId);
        if (transaction.status === 'completed') {
          setCompletedTransaction(transaction);
          setQrModalOpen(false);
          setPendingTransactionId(null);
          clearCart();
          setReceiptOpen(true);
        } else if (transaction.status === 'voided' || transaction.status === 'refunded') {
          toast.error('Pago rechazado o cancelado');
          setQrModalOpen(false);
          setPendingTransactionId(null);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    };

    const interval = setInterval(pollPayment, 2000);
    return () => clearInterval(interval);
  }, [pendingTransactionId, qrModalOpen, clearCart, setReceiptOpen]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex flex-col lg:flex-row h-full">
      <div className="flex-1 min-h-0 overflow-hidden">
        <ProductGrid
          products={products}
          categories={categories}
          onAddToCart={handleAddToCart}
        />
      </div>

      <div className="hidden lg:block w-96 border-l shrink-0">
        <CartPanel onCheckout={() => setCheckoutOpen(true)} />
      </div>

      {/* Floating mobile cart bar */}
      {items.length > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="lg:hidden fixed bottom-4 inset-x-4 z-30 flex items-center justify-between gap-3 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg active:bg-blue-700"
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-2 -right-2 bg-white text-blue-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <span className="font-medium">Ver carrito</span>
          </div>
          <span className="font-bold">${getTotal().toFixed(2)}</span>
        </button>
      )}

      {/* Mobile cart drawer */}
      {mobileCartOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col">
          <div className="flex-1 bg-black/50" onClick={() => setMobileCartOpen(false)} />
          <div className="bg-white h-[85vh] rounded-t-2xl flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <h2 className="text-lg font-semibold">Pedido actual</h2>
              <button
                onClick={() => setMobileCartOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X size={22} />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <CartPanel
                onCheckout={() => {
                  setMobileCartOpen(false);
                  setCheckoutOpen(true);
                }}
                hideHeader
              />
            </div>
          </div>
        </div>
      )}

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

      {/* QR Code Modal for Mercado Pago */}
      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Escaneá para pagar" size="sm">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center text-blue-600">
            <QrCode size={64} />
          </div>
          <p className="text-gray-600">Escaneá el código QR con la app de Mercado Pago o Mercado Pago</p>

          {qrData?.qr_image_url ? (
            <img
              src={qrData.qr_image_url}
              alt="QR Code"
              className="mx-auto w-64 h-64 object-contain border rounded-lg"
            />
          ) : qrData?.qr_data ? (
            <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <span className="ml-2 text-gray-500">Cargando código QR...</span>
            </div>
          ) : null}

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">ID de pago</p>
            <p className="font-mono text-sm">{qrData?.payment_id || 'N/A'}</p>
          </div>

          <p className="text-sm text-gray-500">
            Esperando confirmación de pago...
          </p>
        </div>
      </Modal>
    </div>
  );
}
