import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createProductSchema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  cost: z.number().positive().optional(),
  category_id: z.string().uuid('Invalid category ID').optional(),
  image_url: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  sort_order: z.number().int().optional(),
});

export const addCartItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const createTransactionSchema = z.object({
  payment_method: z.enum(['cash', 'card', 'mixed']),
  amount_paid: z.number().positive('Amount paid must be positive'),
  discount_amount: z.number().min(0).default(0),
  customer_name: z.string().optional(),
  notes: z.string().optional(),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  low_stock_threshold: z.number().int().min(0).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
