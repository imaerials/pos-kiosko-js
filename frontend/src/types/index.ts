export interface User {
  id: string;
  email: string;
  name: string;
  role: 'cashier' | 'manager' | 'admin';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  price: number;
  cost: number | null;
  category_id: string | null;
  image_url: string | null;
  quantity?: number;
  low_stock_threshold?: number;
  category_name?: string;
  category_slug?: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name: string;
  product_sku: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  receipt_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'mixed';
  amount_paid: number;
  change_given: number;
  status: 'completed' | 'refunded' | 'voided';
  customer_name: string | null;
  notes: string | null;
  created_at: string;
  items: TransactionItem[];
  user?: { name: string };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  product_name?: string;
  sku?: string;
}
