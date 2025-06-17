import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';

// Generar secreto y código QR
export const generateAuthenticatorSecret = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(401).json({ message: 'No autenticado' });

  const secret = speakeasy.generateSecret({
    name: `RaffleApp (${user.email})`,
  });

  // Opcional: guardar temporalmente el secret si no está activo
  await User.findByIdAndUpdate(user._id, {
    authenticatorSecret: secret.base32,
  });

  const qr = await QRCode.toDataURL(secret.otpauth_url!);
  res.json({ otpauth_url: secret.otpauth_url, qr, secret: secret.base32 });
};

// Activar 2FA validando el código del usuario
export const enableAuthenticator = async (req: Request, res: Response) => {
  const user = req.user;
  const { token } = req.body;

  const foundUser = await User.findById(user._id);
  if (!foundUser?.authenticatorSecret) return res.status(400).json({ message: 'Primero genera el secreto' });

  const isVerified = speakeasy.totp.verify({
    secret: foundUser.authenticatorSecret,
    encoding: 'base32',
    token,
  });

  if (!isVerified) return res.status(400).json({ message: 'Código inválido' });

  foundUser.isAuthenticatorEnabled = true;
  await foundUser.save();
  res.json({ message: '2FA activado correctamente' });
};

// Desactivar 2FA
export const disableAuthenticator = async (req: Request, res: Response) => {
  const user = req.user;

  await User.findByIdAndUpdate(user._id, {
    isAuthenticatorEnabled: false,
    authenticatorSecret: null,
  });

  res.json({ message: '2FA desactivado' });
};

//Verificar el Código 2FA
export const verifyAuthenticatorCode = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    const userInDb = await User.findById(user._id);
    if (!userInDb || !userInDb.authenticatorSecret) {
      return res.status(400).json({ success: false, message: 'No se ha generado un secreto para este usuario' });
    }

    const verified = speakeasy.totp.verify({
      secret: userInDb.authenticatorSecret,
      encoding: 'base32',
      token,
      window: 1 // tolerancia de 30 segundos
    });

    if (!verified) {
      return res.status(400).json({ success: false, message: 'El código de autenticación es inválido' });
    }

    // Activar 2FA
    userInDb.isAuthenticatorEnabled = true;
    await userInDb.save();

    return res.status(200).json({
      success: true,
      message: 'Autenticación de Google verificada y activada correctamente'
    });
  } catch (error) {
    console.error('Error al verificar Google Authenticator:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al verificar autenticador'
    });
  }
};