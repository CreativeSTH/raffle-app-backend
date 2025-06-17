import { Router } from 'express';
import {
  generateAuthenticatorSecret,
  enableAuthenticator,
  disableAuthenticator,
  verifyAuthenticatorCode,
} from '../controllers/authenticatorController';
import { authenticateToken } from '../middlewares/authenticatorToken';

const authenticatorRoutes = Router();

authenticatorRoutes.get('/generate', authenticateToken, generateAuthenticatorSecret);
authenticatorRoutes.post('/enable', authenticateToken, enableAuthenticator);
authenticatorRoutes.post('/disable', authenticateToken, disableAuthenticator);
authenticatorRoutes.post('/verify', authenticateToken, verifyAuthenticatorCode);

export default authenticatorRoutes;
