import bcrypt from 'bcryptjs';
import { pool } from './index.js';

const SALT_ROUNDS = 10;

async function seed() {
  console.log('Seeding users...');

  try {
    await pool.query('BEGIN');

    await pool.query('DELETE FROM users');

    const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS);
    const managerHash = await bcrypt.hash('manager123', SALT_ROUNDS);
    const cashierHash = await bcrypt.hash('cashier123', SALT_ROUNDS);

    await pool.query(`
      INSERT INTO users (email, password_hash, name, role) VALUES
      ('admin@pos.local',    $1, 'Admin User',   'admin'),
      ('manager@pos.local',  $2, 'Manager User', 'manager'),
      ('cashier@pos.local',  $3, 'Cashier One',  'cashier'),
      ('cashier2@pos.local', $3, 'Cashier Two',  'cashier')
    `, [adminHash, managerHash, cashierHash]);

    await pool.query('COMMIT');
    console.log('Users seeded successfully!');
    console.log('  admin@pos.local    / admin123');
    console.log('  manager@pos.local  / manager123');
    console.log('  cashier@pos.local  / cashier123');
    console.log('  cashier2@pos.local / cashier123');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Seed failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed().catch(console.error);
