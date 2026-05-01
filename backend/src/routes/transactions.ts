import { Router } from 'express';
import { transactionController } from '../controllers/transactionController.js';
import { validate } from '../middleware/validation.js';
import { createTransactionSchema, refundTransactionSchema } from '../utils/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, transactionController.getAll);
router.get('/receipt/:receiptNumber', authenticate, transactionController.getByReceiptNumber);
router.get('/daily-sales', authenticate, transactionController.getDailySales);
router.get('/:id', authenticate, transactionController.getById);

router.post('/', authenticate, validate(createTransactionSchema), transactionController.create);
router.post('/:id/refund', authenticate, validate(refundTransactionSchema), transactionController.refund);

export default router;