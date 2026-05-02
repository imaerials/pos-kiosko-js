import { Router } from 'express';
import { handleWebhook, verifyWebhookSignature } from '../services/mercadoPagoService.js';

const router = Router();

router.post('/mercadopago', (req, res) => {
  const signature = req.headers['x-signature'] as string | undefined;
  const rawBody = JSON.stringify(req.body);

  if (!verifyWebhookSignature(signature, rawBody)) {
    res.status(401).json({ error: 'Invalid webhook signature' });
    return;
  }

  handleWebhook(req.body)
    .then((result) => {
      res.json({ success: true, ...result });
    })
    .catch((error) => {
      console.error('Mercado Pago webhook error:', error.message);
      res.status(500).json({ error: 'Webhook processing failed' });
    });
});

export default router;