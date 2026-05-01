import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', productController.getAll);
router.get('/search', productController.search);
router.get('/sku/:sku', productController.getBySku);
router.get('/barcode/:barcode', productController.getByBarcode);
router.get('/:id', productController.getById);

router.post('/', authenticate, productController.create);
router.put('/:id', authenticate, productController.update);
router.delete('/:id', authenticate, productController.delete);

export default router;