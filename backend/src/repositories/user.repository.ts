import { and, eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import type { User } from '../types/index.js';

export async function findUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const [row] = await db.select().from(users)
    .where(and(eq(users.email, email), eq(users.is_active, true)))
    .limit(1);
  return row ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const [row] = await db.select().from(users)
    .where(and(eq(users.id, id), eq(users.is_active, true)))
    .limit(1);
  return row ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  name: string,
  role: 'cashier' | 'manager' | 'admin'
): Promise<User> {
  const [row] = await db.insert(users)
    .values({ email, password_hash: passwordHash, name, role })
    .returning();
  return row;
}
