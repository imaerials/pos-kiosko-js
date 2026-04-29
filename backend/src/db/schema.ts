import {
  boolean,
  customType,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const numericAsNumber = customType<{
  data: number;
  driverData: string;
  config: { precision?: number; scale?: number };
}>({
  dataType(config) {
    if (config?.precision !== undefined) {
      return `numeric(${config.precision}, ${config.scale ?? 0})`;
    }
    return 'numeric';
  },
  fromDriver: (value: string) => Number(value),
  toDriver: (value: number) => String(value),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().$type<'cashier' | 'manager' | 'admin'>(),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  image_url: varchar('image_url', { length: 500 }),
  sort_order: integer('sort_order').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  barcode: varchar('barcode', { length: 50 }).unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: numericAsNumber('price', { precision: 10, scale: 2 }).notNull(),
  cost: numericAsNumber('cost', { precision: 10, scale: 2 }),
  category_id: uuid('category_id').references(() => categories.id),
  image_url: varchar('image_url', { length: 500 }),
  is_active: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const inventory = pgTable('inventory', {
  id: uuid('id').primaryKey().defaultRandom(),
  product_id: uuid('product_id').notNull().unique().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(0),
  low_stock_threshold: integer('low_stock_threshold').notNull().default(10),
  last_restocked_at: timestamp('last_restocked_at'),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id),
  session_id: varchar('session_id', { length: 100 }),
  status: varchar('status', { length: 20 }).notNull().default('active').$type<'active' | 'converted' | 'abandoned'>(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cart_id: uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  product_id: uuid('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unit_price: numericAsNumber('unit_price', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  receipt_number: varchar('receipt_number', { length: 50 }).notNull().unique(),
  user_id: uuid('user_id').references(() => users.id),
  subtotal: numericAsNumber('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax_amount: numericAsNumber('tax_amount', { precision: 10, scale: 2 }).notNull(),
  discount_amount: numericAsNumber('discount_amount', { precision: 10, scale: 2 }).notNull().default(0),
  total: numericAsNumber('total', { precision: 10, scale: 2 }).notNull(),
  payment_method: varchar('payment_method', { length: 20 }).notNull().$type<'cash' | 'card' | 'mixed'>(),
  amount_paid: numericAsNumber('amount_paid', { precision: 10, scale: 2 }).notNull(),
  change_given: numericAsNumber('change_given', { precision: 10, scale: 2 }).notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('completed').$type<'completed' | 'refunded' | 'voided'>(),
  customer_name: varchar('customer_name', { length: 100 }),
  notes: text('notes'),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

export const transactionItems = pgTable('transaction_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  transaction_id: uuid('transaction_id').notNull().references(() => transactions.id, { onDelete: 'cascade' }),
  product_id: uuid('product_id').notNull().references(() => products.id),
  product_name: varchar('product_name', { length: 255 }).notNull(),
  product_sku: varchar('product_sku', { length: 50 }).notNull(),
  quantity: integer('quantity').notNull(),
  unit_price: numericAsNumber('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numericAsNumber('subtotal', { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});
