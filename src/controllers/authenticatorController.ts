import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { generateJWToken } from '../utils/helpers';
import { sendEmail } from '../services/emailSender';
import { googleAuthEnableEmail, googleAuthDisableEmail } from '../utils/emailTemplates';
import { auditService } from '../services/audit.service';
import { AuditAction } from '../constants/auditActions';

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
 
  // Activamos
  user.isAuthenticatorEnabled = true;
  await user.save();

  //Enviar correo de confirmación
  const subject = "2FA Activado Correctamente 🎯";
  const html = googleAuthEnableEmail(user.name);
  await sendEmail({ to: user.email, subject, html });

  // 👇 Registro de auditoría
  await auditService.logEvent(
    req,
    AuditAction.ENABLE_2FA,
    `2FA Activado para el usuario ${user.email}`,
    user._id.toString()
  );

  res.json({ message: '2FA activado correctamente' });
};

// Desactivar 2FA
export const disableAuthenticator = async (req: Request, res: Response) => {
  const userId = req.userId;
  await User.findByIdAndUpdate(userId, {
    isAuthenticatorEnabled: false,
    authenticatorSecret: null,
  });
  
  const user = await User.findById(userId);
  if(user){
    //Enviar correo de confirmación
    const subject = "2FA Desactivado Correctamente 🎯";
    const html = googleAuthDisableEmail(user.name);
    await sendEmail({ to: user.email, subject, html });

    // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.DISABLE_2FA,
      `2FA desactivado para el usuario ${user.email}`,
      user._id.toString()
    );
  }
  
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

    // Verificar si está bloqueado
    if (user.lockedUntil2FA && user.lockedUntil2FA > new Date()) {
      const remaining = Math.ceil((user.lockedUntil2FA.getTime() - Date.now()) / 60000);
      return res.status(403).json({ message: `Demasiados intentos fallidos. Intenta de nuevo en ${remaining} minutos.` });
    }

    // Verificar código TOTP
    const isValid = speakeasy.totp.verify({
      secret: user.authenticatorSecret,
      encoding: 'base32',
      token,
      window: 1
    });

    if (!isValid) {
      user.failed2FAAttempts += 1;

      // Si es el cuarto intento, mostrar advertencia
      if (user.failed2FAAttempts === 4) {
        await user.save();
        return res.status(400).json({
          message: 'Último intento antes de que tu acceso se bloquee por 15 minutos por múltiples intentos fallidos.'
        });
      }

      if (user.failed2FAAttempts >= 5) {
        user.lockedUntil2FA = new Date(Date.now() + 15 * 60 * 1000); // Bloqueado 15 minutos
        await user.save();
        return res.status(403).json({ message: 'Demasiados intentos fallidos. Usuario bloqueado temporalmente.' });
      }

      await user.save();

      return res.status(400).json({ message: 'Código 2FA inválido' });
    }

    // Código válido: resetear intentos fallidos
    user.failed2FAAttempts = 0;
    user.lockedUntil2FA = null;
    await user.save();

    // Generar token JWT final
    const finalToken = generateJWToken(user._id.toString());

    // 👇 Registro de auditoría
    await auditService.logEvent(
      req,
      AuditAction.LOGIN,
      `Inicio de sesión exitoso para el usuario ${user.email} usando 2FA`,
      user._id.toString()
    );

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