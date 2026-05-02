import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { loginSchema, registerSchema } from '../utils/validation.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { registrationAllowlist } from '../middleware/registrationAllowlist.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), registrationAllowlist, authController.register);
router.post('/logout', (_req, res) => res.json({ success: true }));
router.get('/me', authenticate, authController.me);
router.post('/users', authenticate, authorize('admin', 'manager'), authController.createUser);

export default router;