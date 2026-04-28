export interface User {
  id: string;
  email: string;
  name: string;
  role: 'cashier' | 'manager' | 'admin';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
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
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  category?: Category;
  inventory?: Inventory;
}

export interface Inventory {
  id: string;
  product_id: string;
  quantity: number;
  low_stock_threshold: number;
  last_restocked_at: Date | null;
  updated_at: Date;
}

export interface Cart {
  id: string;
  user_id: string | null;
  session_id: string | null;
  status: 'active' | 'converted' | 'abandoned';
  created_at: Date;
  updated_at: Date;
  items?: CartItem[];
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: Date;
  updated_at: Date;
  product?: Product;
}

export interface Transaction {
  id: string;
  receipt_number: string;
  user_id: string | null;
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
  created_at: Date;
  items?: TransactionItem[];
  user?: User;
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
  created_at: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'cashier' | 'manager' | 'admin';
}

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}
