// src/routes/auth.routes.ts
import { Router } from 'express';
import { register, verifyEmail, login, requestOtp, verifyOtpLogin, forgotPassword, verifyResetCode, resetPassword  } from '../controllers/AuthController';
import { authLimiter } from '../middlewares/rateLimiter';
import { validateBody } from '../middlewares/validateBody';
import { loginSchema, registerSchema, requestOtpSchema, verifyOtpLoginSchema, requestResetPasswordSchema, verifyResetPasswordCodeSchema, resetPassSchema } from '../schemas/auth.schema'

const router = Router();

// Ruta para registrar un nuevo usuario
router.post('/register', authLimiter, validateBody(registerSchema), register);
router.get('/verify-email', verifyEmail);
// Ruta para Loguear un usuario
router.post('/login', authLimiter, validateBody(loginSchema), login);
// Ruta para realizar un request OTP
router.post('/request-otp', authLimiter, validateBody(requestOtpSchema), requestOtp);
router.post('/verify-otp-login', validateBody(verifyOtpLoginSchema), verifyOtpLogin);
// Ruta para reset password
router.post('/forgot-password',authLimiter, validateBody(requestResetPasswordSchema), forgotPassword);
router.post('/verify-reset-code',authLimiter, validateBody(verifyResetPasswordCodeSchema), verifyResetCode);
router.post('/reset-password',authLimiter, validateBody(resetPassSchema), resetPassword);

export default router;
