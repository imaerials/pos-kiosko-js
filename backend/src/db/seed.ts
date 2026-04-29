import bcrypt from 'bcryptjs';
import { pool } from './index.js';

const SALT_ROUNDS = 10;

async function seed() {
  console.log('Starting database seed...');

  try {
    await pool.query('BEGIN');

    // Clear existing data
    await pool.query('DELETE FROM transaction_items');
    await pool.query('DELETE FROM transactions');
    await pool.query('DELETE FROM cart_items');
    await pool.query('DELETE FROM carts');
    await pool.query('DELETE FROM inventory');
    await pool.query('DELETE FROM products');
    await pool.query('DELETE FROM categories');
    await pool.query('DELETE FROM users');

    // Create users with hashed passwords
    const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    const managerHash = await bcrypt.hash('manager123', SALT_ROUNDS);
    const cashierHash = await bcrypt.hash('cashier123', SALT_ROUNDS);

    await pool.query(`
      INSERT INTO users (email, password_hash, name, role) VALUES
      ('admin@pos.local', $1, 'Admin User', 'admin'),
      ('manager@pos.local', $2, 'Manager User', 'manager'),
      ('cashier@pos.local', $3, 'Cashier One', 'cashier'),
      ('cashier2@pos.local', $3, 'Cashier Two', 'cashier')
    `, [adminHash, managerHash, cashierHash]);

    // Create categories
    const categoriesResult = await pool.query(`
      INSERT INTO categories (name, slug, description, sort_order) VALUES
      ('Produce', 'produce', 'Fresh fruits and vegetables', 1),
      ('Dairy', 'dairy', 'Milk, cheese, eggs, and dairy products', 2),
      ('Bakery', 'bakery', 'Fresh bread, pastries, and baked goods', 3),
      ('Beverages', 'beverages', 'Drinks and refreshments', 4),
      ('Snacks', 'snacks', 'Chips, cookies, candy, and treats', 5)
      RETURNING id, slug
    `);

    const categoryMap = categoriesResult.rows.reduce((acc, row) => {
      acc[row.slug] = row.id;
      return acc;
    }, {} as Record<string, string>);

    // Create products
    const products = [
      // Produce
      ['PROD001', '123456789001', 'Bananas', 'Fresh yellow bananas per lb', 0.59, 0.25, categoryMap['produce']],
      ['PROD002', '123456789002', 'Apples Gala', 'Fresh gala apples per lb', 1.29, 0.55, categoryMap['produce']],
      ['PROD003', '123456789003', 'Oranges', 'Fresh oranges each', 0.79, 0.30, categoryMap['produce']],
      ['PROD004', '123456789004', 'Tomatoes', 'Vine-ripened tomatoes per lb', 2.49, 1.10, categoryMap['produce']],
      ['PROD005', '123456789005', 'Lettuce Romaine', 'Fresh romaine lettuce head', 2.99, 1.20, categoryMap['produce']],
      // Dairy
      ['DAIR001', '223456789001', 'Whole Milk', 'Gallon of fresh whole milk', 4.29, 2.10, categoryMap['dairy']],
      ['DAIR002', '223456789002', 'Large Eggs', 'Dozen large grade A eggs', 5.99, 3.00, categoryMap['dairy']],
      ['DAIR003', '223456789003', 'Cheddar Cheese', 'Sharp cheddar cheese block 8oz', 4.49, 2.20, categoryMap['dairy']],
      ['DAIR004', '223456789004', 'Greek Yogurt', 'Vanilla Greek yogurt 32oz', 6.99, 3.50, categoryMap['dairy']],
      ['DAIR005', '223456789005', 'Butter', 'Salted butter stick 4oz', 2.99, 1.40, categoryMap['dairy']],
      // Bakery
      ['BAKY001', '323456789001', 'White Bread', 'Fresh white sandwich bread loaf', 3.49, 1.50, categoryMap['bakery']],
      ['BAKY002', '323456789002', 'Croissants', 'Butter croissants 4 pack', 5.99, 2.80, categoryMap['bakery']],
      ['BAKY003', '323456789003', 'Bagels', 'Plain bagels 6 pack', 4.49, 2.00, categoryMap['bakery']],
      ['BAKY004', '323456789004', 'Muffins', 'Blueberry muffins 4 pack', 6.49, 3.00, categoryMap['bakery']],
      // Beverages
      ['BEVR001', '423456789001', 'Orange Juice', 'Fresh squeezed OJ 64oz', 5.99, 3.00, categoryMap['beverages']],
      ['BEVR002', '423456789002', 'Cola 12-Pack', 'Cola cans 12oz 12 pack', 6.49, 3.50, categoryMap['beverages']],
      ['BEVR003', '423456789003', 'Bottled Water', 'Spring water 24 pack', 4.99, 2.00, categoryMap['beverages']],
      ['BEVR004', '423456789004', 'Coffee Beans', 'Medium roast coffee 12oz', 12.99, 6.50, categoryMap['beverages']],
      // Snacks
      ['SNK001', '523456789001', 'Potato Chips', 'Classic salted chips 10oz', 4.49, 2.00, categoryMap['snacks']],
      ['SNK002', '523456789002', 'Chocolate Cookies', 'Chocolate chip cookies family size', 4.99, 2.20, categoryMap['snacks']],
      ['SNK003', '523456789003', 'Mixed Nuts', 'Roasted mixed nuts 16oz', 9.99, 5.00, categoryMap['snacks']],
      ['SNK004', '523456789004', 'Granola Bars', 'Oatmeal granola bars 6 pack', 5.49, 2.50, categoryMap['snacks']],
    ];

    const productIds: string[] = [];
    for (const [sku, barcode, name, description, price, cost, categoryId] of products) {
      const result = await pool.query(`
        INSERT INTO products (sku, barcode, name, description, price, cost, category_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `, [sku, barcode, name, description, price, cost, categoryId]);
      productIds.push(result.rows[0].id);
    }

    // Create inventory for all products
    for (const productId of productIds) {
      const quantity = Math.floor(Math.random() * 100) + 20;
      await pool.query(`
        INSERT INTO inventory (product_id, quantity, low_stock_threshold)
        VALUES ($1, $2, 10)
      `, [productId, quantity]);
    }

    await pool.query('COMMIT');
    console.log('Database seeded successfully!');
    console.log('Users created:');
    console.log('  - admin@pos.local / admin123 (admin)');
    console.log('  - manager@pos.local / manager123 (manager)');
    console.log('  - cashier@pos.local / cashier123 (cashier)');
    console.log('  - cashier2@pos.local / cashier123 (cashier)');
    console.log(`Created ${products.length} products across 5 categories`);

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);
