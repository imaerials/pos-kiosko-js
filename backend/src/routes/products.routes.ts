import { Router } from 'express';
import * as productsController from '../controllers/products.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validateRequest.js';
import { createProductSchema, updateProductSchema } from '../utils/validation.js';

const router = Router();

router.get('/', productsController.getProducts);
router.get('/barcode/:barcode', productsController.getProductByBarcode);
router.get('/:id', productsController.getProduct);

router.post('/', authenticate, authorize('manager', 'admin'), validateBody(createProductSchema), productsController.createProduct);
router.put('/:id', authenticate, authorize('manager', 'admin'), validateBody(updateProductSchema), productsController.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), productsController.deleteProduct);

export default router;
