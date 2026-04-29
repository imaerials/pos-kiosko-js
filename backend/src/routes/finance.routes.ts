import { Router } from 'express';
import * as financeController from '../controllers/finance.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/summary', authenticate, authorize('admin', 'manager'), financeController.getSummary);

export default router;
