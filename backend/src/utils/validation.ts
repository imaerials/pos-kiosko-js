import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(100),
});

export const createProductSchema = z.object({
  sku: z.string().min(1).max(50),
  barcode: z.string().max(50).optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  cost: z.number().positive().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export const createTransactionSchema = z.object({
  payment_method: z.enum(['cash', 'card', 'mixed']),
  amount_paid: z.number().positive(),
  customer_name: z.string().max(100).optional(),
  notes: z.string().optional(),
  discount_amount: z.number().min(0).optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    product_name: z.string().min(1),
    product_sku: z.string().min(1),
    quantity: z.number().int().positive(),
    unit_price: z.number().positive(),
  })).min(1),
});

export const refundTransactionSchema = z.object({
  reason: z.string().optional(),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).optional(),
});

export const restockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type RefundTransactionInput = z.infer<typeof refundTransactionSchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
export type RestockInput = z.infer<typeof restockSchema>;