import { Router } from 'express';
import {
  generateAuthenticatorSecret,
  enableAuthenticator,
  disableAuthenticator,
  verifyLogin2FA,
} from '../controllers/authenticatorController';
import { authMiddleware, authTempToken } from '../middlewares/auth.middleware'

const authenticatorRoutes = Router();

authenticatorRoutes.get('/generate', authMiddleware, generateAuthenticatorSecret);
authenticatorRoutes.post('/enable', authMiddleware, enableAuthenticator);
authenticatorRoutes.post('/disable', authMiddleware, disableAuthenticator);
authenticatorRoutes.post('/verify', authTempToken, verifyLogin2FA);

export default authenticatorRoutes;
