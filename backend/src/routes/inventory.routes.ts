import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorize('manager', 'admin'), inventoryController.getInventory);
router.get('/low-stock', authenticate, inventoryController.getLowStock);
router.put('/:productId', authenticate, authorize('manager', 'admin'), inventoryController.updateInventory);
router.post('/restock', authenticate, authorize('manager', 'admin'), inventoryController.restockInventory);

export default router;
