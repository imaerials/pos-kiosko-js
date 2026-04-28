import { query } from '../config/database.js';
import { User } from '../types/index.js';

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE email = $1 AND is_active = true',
    [email]
  );
  return result.rows[0] || null;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    'SELECT * FROM users WHERE id = $1 AND is_active = true',
    [id]
  );
  return result.rows[0] || null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  name: string,
  role: 'cashier' | 'manager' | 'admin'
): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [email, passwordHash, name, role]
  );
  return result.rows[0];
}
