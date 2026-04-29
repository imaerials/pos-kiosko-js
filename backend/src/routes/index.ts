import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productsRoutes from './products.routes.js';
import categoriesRoutes from './categories.routes.js';
import cartRoutes from './cart.routes.js';
import transactionsRoutes from './transactions.routes.js';
import inventoryRoutes from './inventory.routes.js';
import financeRoutes from './finance.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/cart', cartRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/finance', financeRoutes);

export default router;
