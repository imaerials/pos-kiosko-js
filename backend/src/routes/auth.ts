import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middleware/validation.js';
import { loginSchema, registerSchema } from '../utils/validation.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.get('/me', authenticate, authController.me);

export default router;