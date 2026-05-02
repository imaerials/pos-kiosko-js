import axios from 'axios';
import type {
  AuthResponse,
  User,
  Product,
  Category,
  Cart,
  CartItem,
  Transaction,
  Inventory,
} from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (response.data?.success && response.data?.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },
  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* stateless JWT, ignore errors */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  },
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
  createUser: async (name: string, email: string, password: string, role: 'cashier' | 'manager'): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/users', { name, email, password, role });
    return data;
  },
};

export const productsApi = {
  getAll: async (categoryId?: string): Promise<Product[]> => {
    const params = categoryId ? { categoryId } : {};
    const { data } = await api.get<{ items: Product[] } | Product[]>('/products', { params });
    return Array.isArray(data) ? data : data.items;
  },
  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },
  getByBarcode: async (barcode: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/barcode/${barcode}`);
    return data;
  },
  create: async (payload: {
    sku: string;
    name: string;
    price: number;
    description?: string;
    barcode?: string;
    cost?: number;
    category_id?: string;
  }): Promise<Product> => {
    const { data } = await api.post<Product>('/products', payload);
    return data;
  },
  update: async (id: string, payload: {
    sku?: string;
    name?: string;
    price?: number;
    description?: string;
    barcode?: string;
    cost?: number;
    category_id?: string;
  }): Promise<Product> => {
    const { data } = await api.put<Product>(`/products/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const { data } = await api.get<{ items: Category[] } | Category[]>('/categories');
    return Array.isArray(data) ? data : data.items;
  },
};

export const cartApi = {
  get: async (): Promise<Cart> => {
    const { data } = await api.get<Cart>('/cart');
    return data;
  },
  addItem: async (productId: string, quantity: number): Promise<CartItem> => {
    const { data } = await api.post<CartItem>('/cart/items', { product_id: productId, quantity });
    return data;
  },
  updateItem: async (itemId: string, quantity: number): Promise<CartItem> => {
    const { data } = await api.put<CartItem>(`/cart/items/${itemId}`, { quantity });
    return data;
  },
  removeItem: async (itemId: string): Promise<void> => {
    await api.delete(`/cart/items/${itemId}`);
  },
  clear: async (): Promise<void> => {
    await api.delete('/cart');
  },
};

export const transactionsApi = {
  getAll: async (limit = 50, page = 1): Promise<Transaction[]> => {
    const { data } = await api.get<{ items: Transaction[] } | Transaction[]>('/transactions', { params: { limit, page } });
    return Array.isArray(data) ? data : data.items;
  },
  getById: async (id: string): Promise<Transaction> => {
    const { data } = await api.get<Transaction>(`/transactions/${id}`);
    return data;
  },
  create: async (payload: {
    payment_method: 'cash' | 'card' | 'mixed';
    amount_paid: number;
    discount_amount?: number;
    customer_name?: string;
    notes?: string;
    items: {
      product_id: string;
      product_name: string;
      product_sku: string;
      quantity: number;
      unit_price: number;
    }[];
  }): Promise<Transaction> => {
    const { data } = await api.post<Transaction>('/transactions', payload);
    return data;
  },
  refund: async (id: string): Promise<Transaction> => {
    const { data } = await api.post<Transaction>(`/transactions/${id}/refund`);
    return data;
  },
};

export const financeApi = {
  getSummary: async (period: 'today' | 'week' | 'month' | 'year' = 'month') => {
    const { data } = await api.get('/finance/summary', { params: { period } });
    return data as {
      period: string;
      revenue: number;
      refunds: number;
      refund_count: number;
      net_revenue: number;
      cogs: number;
      gross_profit: number;
      tax_collected: number;
      discounts_given: number;
      transaction_count: number;
      avg_transaction: number;
      payment_methods: { method: string; amount: number; count: number }[];
      top_products: { product_name: string; units_sold: number; revenue: number }[];
      daily_revenue: { date: string; revenue: number; transactions: number }[];
    };
  },
};

export const inventoryApi = {
  getAll: async (): Promise<Inventory[]> => {
    const { data } = await api.get<Inventory[]>('/inventory');
    return data;
  },
  getLowStock: async (): Promise<Inventory[]> => {
    const { data } = await api.get<Inventory[]>('/inventory/low-stock');
    return data;
  },
  update: async (productId: string, quantity: number, lowStockThreshold?: number): Promise<Inventory> => {
    const payload: { quantity: number; low_stock_threshold?: number } = { quantity };
    if (lowStockThreshold !== undefined) {
      payload.low_stock_threshold = lowStockThreshold;
    }
    const { data } = await api.put<Inventory>(`/inventory/${productId}`, payload);
    return data;
  },
};
