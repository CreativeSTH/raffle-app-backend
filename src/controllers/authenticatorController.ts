import { Request, Response } from 'express';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import User from '../models/User';

export const generate2FASetup = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const secret = speakeasy.generateSecret({
      name: 'App de Rifas', // Cambia por el nombre de tu app
    });

    const qrCodeDataURL = await qrcode.toDataURL(secret.otpauth_url!);

    // Guarda el secreto temporalmente en la DB
    await User.findByIdAndUpdate(userId, {
      authenticatorSecret: secret.base32,
    });

    return res.json({
      qrCodeDataURL,
      secret: secret.base32,
      message: 'Escanea el código QR con Google Authenticator',
    });
  } catch (error) {
    console.error('Error generando QR:', error);
    return res.status(500).json({ message: 'Error interno al generar QR' });
  }
};
