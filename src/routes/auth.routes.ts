// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, verifyEmail, login  } from '../controllers/AuthController';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validateBody';
import { loginSchema, registerSchema } from '../schemas/auth.schema'

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/register', authLimiter, validateBody(registerSchema), register);
router.get('/verify-email', verifyEmail);
router.post('/login', authLimiter, validateBody(loginSchema), login);

export default router;
