// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, verifyEmail, login  } from '../controllers/AuthController';

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);

export default router;
