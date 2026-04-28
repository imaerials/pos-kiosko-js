-- Seed data for Grocery POS

-- Admin user (password: admin123)
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@pos.local', '$2b$10$rQZ8qCk0vN5Z0X5Y5Z0Z0uJkLpQrQrQrQrQrQrQrQrQrQrQrQrQr', 'Admin User', 'admin'),
('manager@pos.local', '$2b$10$rQZ8qCk0vN5Z0X5Y5Z0Z0uJkLpQrQrQrQrQrQrQrQrQrQrQrQrQr', 'Manager User', 'manager'),
('cashier@pos.local', '$2b$10$rQZ8qCk0vN5Z0X5Y5Z0Z0uJkLpQrQrQrQrQrQrQrQrQrQrQrQrQr', 'Cashier One', 'cashier'),
('cashier2@pos.local', '$2b$10$rQZ8qCk0vN5Z0X5Y5Z0Z0uJkLpQrQrQrQrQrQrQrQrQrQrQrQrQr', 'Cashier Two', 'cashier');

-- Categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Produce', 'produce', 'Fresh fruits and vegetables', 1),
('Dairy', 'dairy', 'Milk, cheese, eggs, and dairy products', 2),
('Bakery', 'bakery', 'Fresh bread, pastries, and baked goods', 3),
('Beverages', 'beverages', 'Drinks and refreshments', 4),
('Snacks', 'snacks', 'Chips, cookies, candy, and treats', 5);

-- Products
INSERT INTO products (sku, barcode, name, description, price, cost, category_id) VALUES
-- Produce
('PROD001', '123456789001', 'Bananas', 'Fresh yellow bananas per lb', 0.59, 0.25, (SELECT id FROM categories WHERE slug = 'produce')),
('PROD002', '123456789002', 'Apples Gala', 'Fresh gala apples per lb', 1.29, 0.55, (SELECT id FROM categories WHERE slug = 'produce')),
('PROD003', '123456789003', 'Oranges', 'Fresh oranges each', 0.79, 0.30, (SELECT id FROM categories WHERE slug = 'produce')),
('PROD004', '123456789004', 'Tomatoes', 'Vine-ripened tomatoes per lb', 2.49, 1.10, (SELECT id FROM categories WHERE slug = 'produce')),
('PROD005', '123456789005', 'Lettuce Romaine', 'Fresh romaine lettuce head', 2.99, 1.20, (SELECT id FROM categories WHERE slug = 'produce')),

-- Dairy
('DAIR001', '223456789001', 'Whole Milk', 'Gallon of fresh whole milk', 4.29, 2.10, (SELECT id FROM categories WHERE slug = 'dairy')),
('DAIR002', '223456789002', 'Large Eggs', 'Dozen large grade A eggs', 5.99, 3.00, (SELECT id FROM categories WHERE slug = 'dairy')),
('DAIR003', '223456789003', 'Cheddar Cheese', 'Sharp cheddar cheese block 8oz', 4.49, 2.20, (SELECT id FROM categories WHERE slug = 'dairy')),
('DAIR004', '223456789004', 'Greek Yogurt', 'Vanilla Greek yogurt 32oz', 6.99, 3.50, (SELECT id FROM categories WHERE slug = 'dairy')),
('DAIR005', '223456789005', 'Butter', 'Salted butter stick 4oz', 2.99, 1.40, (SELECT id FROM categories WHERE slug = 'dairy')),

-- Bakery
('BAKY001', '323456789001', 'White Bread', 'Fresh white sandwich bread loaf', 3.49, 1.50, (SELECT id FROM categories WHERE slug = 'bakery')),
('BAKY002', '323456789002', 'Croissants', 'Butter croissants 4 pack', 5.99, 2.80, (SELECT id FROM categories WHERE slug = 'bakery')),
('BAKY003', '323456789003', 'Bagels', 'Plain bagels 6 pack', 4.49, 2.00, (SELECT id FROM categories WHERE slug = 'bakery')),
('BAKY004', '323456789004', 'Muffins', 'Blueberry muffins 4 pack', 6.49, 3.00, (SELECT id FROM categories WHERE slug = 'bakery')),

-- Beverages
('BEVR001', '423456789001', 'Orange Juice', 'Fresh squeezed OJ 64oz', 5.99, 3.00, (SELECT id FROM categories WHERE slug = 'beverages')),
('BEVR002', '423456789002', 'Cola 12-Pack', 'Cola cans 12oz 12 pack', 6.49, 3.50, (SELECT id FROM categories WHERE slug = 'beverages')),
('BEVR003', '423456789003', 'Bottled Water', 'Spring water 24 pack', 4.99, 2.00, (SELECT id FROM categories WHERE slug = 'beverages')),
('BEVR004', '423456789004', 'Coffee Beans', 'Medium roast coffee 12oz', 12.99, 6.50, (SELECT id FROM categories WHERE slug = 'beverages')),

-- Snacks
('SNK001', '523456789001', 'Potato Chips', 'Classic salted chips 10oz', 4.49, 2.00, (SELECT id FROM categories WHERE slug = 'snacks')),
('SNK002', '523456789002', 'Chocolate Cookies', 'Chocolate chip cookies family size', 4.99, 2.20, (SELECT id FROM categories WHERE slug = 'snacks')),
('SNK003', '523456789003', 'Mixed Nuts', 'Roasted mixed nuts 16oz', 9.99, 5.00, (SELECT id FROM categories WHERE slug = 'snacks')),
('SNK004', '523456789004', 'Granola Bars', 'Oatmeal granola bars 6 pack', 5.49, 2.50, (SELECT id FROM categories WHERE slug = 'snacks'));

-- Inventory
INSERT INTO inventory (product_id, quantity, low_stock_threshold)
SELECT id, FLOOR(RANDOM() * 100 + 20)::INTEGER, 10 FROM products;
