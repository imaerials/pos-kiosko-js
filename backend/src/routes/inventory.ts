import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/low-stock', authenticate, inventoryController.getLowStock);
router.get('/product/:productId', inventoryController.getByProductId);

router.put('/product/:productId', authenticate, inventoryController.update);
router.post('/restock', authenticate, inventoryController.restock);

export default router;