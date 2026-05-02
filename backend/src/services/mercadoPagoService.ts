import { MercadoPagoConfig, Payment, MerchantOrder } from 'mercadopago';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { config } from '../config/index.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

let client: MercadoPagoConfig | null = null;

function getClient(): MercadoPagoConfig {
  if (!client) {
    if (!config.mercadoPagoAccessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN not configured');
    }
    client = new MercadoPagoConfig({
      accessToken: config.mercadoPagoAccessToken,
    });
  }
  return client;
}

export interface QRPaymentResult {
  paymentId: string;
  qrData: string;
  qrImageUrl: string;
}

export async function createQRPayment(
  total: number,
  receiptNumber: string,
  description?: string
): Promise<QRPaymentResult> {
  const payment = new Payment(getClient());

  const result = await payment.create({
    body: {
      transaction_amount: Number(total),
      description: description || `FlowPOS Sale ${receiptNumber}`,
      payment_method_id: 'pix',
      external_reference: receiptNumber,
      point_of_interaction: {
        type: 'QR',
      },
    },
  });

  const qrData = (result.point_of_interaction?.transaction_data as any)?.qr_code_base64 || '';
  const qrImageUrl = (result.point_of_interaction?.transaction_data as any)?.qr_code_image_url || '';

  return {
    paymentId: String(result.id),
    qrData,
    qrImageUrl,
  };
}

export async function getPaymentStatus(paymentId: string): Promise<{
  status: string;
  statusDetail: string;
}> {
  const payment = new Payment(getClient());
  const result = await payment.get({ id: paymentId });

  return {
    status: result.status || 'pending',
    statusDetail: result.status_detail || '',
  };
}

export async function handleWebhook(payload: any): Promise<{
  transactionId: string;
  newStatus: string;
}> {
  const paymentId = payload.data?.id;

  if (!paymentId) {
    throw new BadRequestError('Invalid webhook payload: missing data.id');
  }

  const payment = new Payment(getClient());
  const mpPayment = await payment.get({ id: paymentId });

  const externalRef = mpPayment.external_reference;
  if (!externalRef) {
    throw new BadRequestError('Payment has no external_reference');
  }

  const transaction = await prisma.transaction.findUnique({
    where: { receiptNumber: externalRef },
  });

  if (!transaction) {
    throw new NotFoundError(`Transaction not found for receipt: ${externalRef}`);
  }

  let newStatus = transaction.status;
  const mpStatus = mpPayment.status;

  if (mpStatus === 'approved') {
    newStatus = 'completed';
  } else if (mpStatus === 'cancelled' || mpStatus === 'rejected') {
    newStatus = 'voided';
  } else if (mpStatus === 'pending') {
    newStatus = 'pending_payment';
  }

  if (newStatus !== transaction.status) {
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus as any,
        mercadoPagoStatus: mpStatus,
        paymentCompletedAt: mpStatus === 'approved' ? new Date() : undefined,
      },
    });
  }

  return { transactionId: transaction.id, newStatus };
}

export function verifyWebhookSignature(
  signature: string | undefined,
  body: string
): boolean {
  if (!config.mercadoPagoWebhookSecret) {
    return true;
  }

  if (!signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', config.mercadoPagoWebhookSecret)
    .update(body)
    .digest('hex');

  return signature === expectedSignature;
}