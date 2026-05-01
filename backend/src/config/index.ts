import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/pos_kiosko',
  jwtSecret: process.env.JWT_SECRET ?? 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  bcryptSaltRounds: 12,
  taxRate: 0.1,
};