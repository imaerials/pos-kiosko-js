import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { config } from '../config/index.js';

async function main() {
  console.log('Seeding database...');

  const [adminHash, managerHash, cashierHash] = await Promise.all([
    bcrypt.hash('admin123', config.bcryptSaltRounds),
    bcrypt.hash('manager123', config.bcryptSaltRounds),
    bcrypt.hash('cashier123', config.bcryptSaltRounds),
  ]);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@pos.local' },
      update: { passwordHash: adminHash },
      create: { email: 'admin@pos.local', passwordHash: adminHash, name: 'Admin User', role: 'admin' },
    }),
    prisma.user.upsert({
      where: { email: 'manager@pos.local' },
      update: { passwordHash: managerHash },
      create: { email: 'manager@pos.local', passwordHash: managerHash, name: 'Manager User', role: 'manager' },
    }),
    prisma.user.upsert({
      where: { email: 'cashier@pos.local' },
      update: { passwordHash: cashierHash },
      create: { email: 'cashier@pos.local', passwordHash: cashierHash, name: 'Cashier User', role: 'cashier' },
    }),
  ]);

  console.log(`Created ${users.length} users`);

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'fruits' },
      update: {},
      create: { name: 'Fruits', slug: 'fruits', description: 'Fresh fruits', sortOrder: 1 },
    }),
    prisma.category.upsert({
      where: { slug: 'vegetables' },
      update: {},
      create: { name: 'Vegetables', slug: 'vegetables', description: 'Fresh vegetables', sortOrder: 2 },
    }),
    prisma.category.upsert({
      where: { slug: 'dairy' },
      update: {},
      create: { name: 'Dairy', slug: 'dairy', description: 'Dairy products', sortOrder: 3 },
    }),
    prisma.category.upsert({
      where: { slug: 'bakery' },
      update: {},
      create: { name: 'Bakery', slug: 'bakery', description: 'Fresh bakery items', sortOrder: 4 },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  const products = [
    { sku: 'APP001', name: 'Apple', price: 1.99, categoryId: categories[0].id },
    { sku: 'BAN001', name: 'Banana', price: 0.59, categoryId: categories[0].id },
    { sku: 'ORG001', name: 'Orange', price: 2.49, categoryId: categories[0].id },
    { sku: 'CAR001', name: 'Carrot', price: 1.29, categoryId: categories[1].id },
    { sku: 'BRO001', name: 'Broccoli', price: 2.99, categoryId: categories[1].id },
    { sku: 'MIL001', name: 'Whole Milk', price: 3.99, categoryId: categories[2].id },
    { sku: 'CHE001', name: 'Cheddar Cheese', price: 5.99, categoryId: categories[2].id },
    { sku: 'BREAD001', name: 'White Bread', price: 2.49, categoryId: categories[3].id },
  ];

  for (const product of products) {
    const created = await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
    await prisma.inventory.upsert({
      where: { productId: created.id },
      update: {},
      create: { productId: created.id, quantity: 100 },
    });
  }

  console.log(`Created ${products.length} products with inventory`);

  console.log('Seeding completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());