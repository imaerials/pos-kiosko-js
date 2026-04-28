import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validateRequest.js';
import { addCartItemSchema, updateCartItemSchema } from '../utils/validation.js';

const router = Router();

router.get('/', authenticate, cartController.getCart);
router.post('/items', authenticate, validateBody(addCartItemSchema), cartController.addItem);
router.put('/items/:id', authenticate, validateBody(updateCartItemSchema), cartController.updateItem);
router.delete('/items/:id', authenticate, cartController.removeItem);
router.delete('/', authenticate, cartController.clearCart);

export default router;
