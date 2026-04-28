import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validateRequest.js';
import { createCategorySchema } from '../utils/validation.js';

const router = Router();

router.get('/', categoriesController.getCategories);
router.get('/:id', categoriesController.getCategory);

router.post('/', authenticate, authorize('manager', 'admin'), validateBody(createCategorySchema), categoriesController.createCategory);
router.put('/:id', authenticate, authorize('manager', 'admin'), validateBody(createCategorySchema), categoriesController.updateCategory);

export default router;
