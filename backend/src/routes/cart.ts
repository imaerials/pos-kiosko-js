import { Router } from 'express';
import { cartController } from '../controllers/cartController.js';
import { validate } from '../middleware/validation.js';
import { addCartItemSchema, updateCartItemSchema } from '../utils/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, cartController.getOrCreate);
router.get('/:id', authenticate, cartController.getById);

router.post('/items', authenticate, validate(addCartItemSchema), cartController.addItem);
router.put('/items/:itemId', authenticate, validate(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:itemId', authenticate, cartController.removeItem);

router.delete('/:id/clear', authenticate, cartController.clearCart);
router.delete('/:id', authenticate, cartController.deleteCart);

export default router;