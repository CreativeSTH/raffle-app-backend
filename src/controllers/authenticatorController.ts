import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';
import { generateJWToken } from '../utils/helpers'
import jwt, { Secret } from 'jsonwebtoken';

// Generar secreto y código QR
export const generateAuthenticatorSecret = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'No autenticado' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

  const secret = speakeasy.generateSecret({
    name: `RaffleApp (${user.email})`,
  });

  user.authenticatorSecret = secret.base32;
  await user.save();

  const qr = await QRCode.toDataURL(secret.otpauth_url!);
  res.json({ otpauth_url: secret.otpauth_url, qr, secret: secret.base32 });
};

// Activar 2FA validando el código del usuario
export const enableAuthenticator = async (req: Request, res: Response) => {
  const userId = req.userId;
  const { token } = req.body;

  const user = await User.findById(userId);
  if (!user?.authenticatorSecret) return res.status(400).json({ message: 'Primero genera el secreto' });

  const isVerified = speakeasy.totp.verify({
    secret: user.authenticatorSecret,
    encoding: 'base32',
    token,
  });

  if (!isVerified) return res.status(400).json({ message: 'Código inválido' });

  user.isAuthenticatorEnabled = true;
  await user.save();

  res.json({ message: '2FA activado correctamente' });
};

// Desactivar 2FA
export const disableAuthenticator = async (req: Request, res: Response) => {
  const userId = req.userId;

  await User.findByIdAndUpdate(userId, {
    isAuthenticatorEnabled: false,
    authenticatorSecret: null,
  });

  res.json({ message: '2FA desactivado' });
};

// Verificación de login con código 2FA
export const verifyLogin2FA = async (req: Request, res: Response) => {
  try {
    const { tempToken, token } = req.body;

    // Validar tempToken
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user || !user.authenticatorSecret) {
      return res.status(400).json({ message: 'Usuario no válido o sin 2FA configurado' });
    }

    // Verificar código TOTP
    const isValid = speakeasy.totp.verify({
      secret: user.authenticatorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!isValid) {
      return res.status(400).json({ message: 'Código 2FA inválido' });
    }

    // Generar token JWT final
    const finalToken = generateJWToken(user._id.toString());

    return res.status(200).json({
      message: 'Login exitoso con 2FA',
      token: finalToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error('Error al verificar 2FA login:', error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};