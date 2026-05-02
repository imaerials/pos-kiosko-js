import dotenv from 'dotenv';
dotenv.config();

const allowedRegistrationEmails = (process.env.ALLOWED_REGISTRATION_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/pos_kiosko',
  jwtSecret: process.env.JWT_SECRET ?? 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  bcryptSaltRounds: 12,
  taxRate: 0.1,
  allowedRegistrationEmails,
  mercadoPagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN ?? '',
  mercadoPagoWebhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET ?? '',
};