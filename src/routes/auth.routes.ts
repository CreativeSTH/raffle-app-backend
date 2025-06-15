// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, verifyEmail, login, requestOtp, verifyOtpLogin  } from '../controllers/AuthController';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validateBody';
import { loginSchema, registerSchema, requestOtpSchema, verifyOtpLoginSchema } from '../schemas/auth.schema'

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/register', authLimiter, validateBody(registerSchema), register);
router.get('/verify-email', verifyEmail);
// Ruta para Loguear un usuario
router.post('/login', authLimiter, validateBody(loginSchema), login);
// Ruta para realizar un request OTP
router.post('/request-otp', authLimiter, validateBody(requestOtpSchema), requestOtp);
router.post('/verify-otp-login', validateBody(verifyOtpLoginSchema), verifyOtpLogin);
export default router;
