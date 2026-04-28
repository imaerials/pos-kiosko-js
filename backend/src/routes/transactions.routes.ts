import { Router } from 'express';
import * as transactionsController from '../controllers/transactions.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validateRequest.js';
import { createTransactionSchema } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, transactionsController.getTransactions);
router.get('/:id', authenticate, transactionsController.getTransaction);

router.post('/', authenticate, validateBody(createTransactionSchema), transactionsController.createTransaction);

router.post('/:id/refund', authenticate, authorize('manager', 'admin'), transactionsController.refundTransaction);

export default router;
