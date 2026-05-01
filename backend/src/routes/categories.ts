import { Router } from 'express';
import { categoryController } from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/', categoryController.getAll);
router.get('/slug/:slug', categoryController.getBySlug);
router.get('/:id', categoryController.getById);

router.post('/', authenticate, categoryController.create);
router.put('/:id', authenticate, categoryController.update);
router.delete('/:id', authenticate, categoryController.delete);

export default router;