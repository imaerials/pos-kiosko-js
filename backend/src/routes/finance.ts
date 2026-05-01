import { Router } from 'express';
import { financeController } from '../controllers/financeController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/summary', authenticate, financeController.getSummary);

export default router;
