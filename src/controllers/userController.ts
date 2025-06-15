import { Request, Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

export const updateOtpPreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { isOTPEnabled } = req.body;

    if (typeof isOTPEnabled !== 'boolean') {
      throw new AppError('El valor de isOTPEnabled debe ser true o false', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    user.isOTPEnabled = isOTPEnabled;
    await user.save();

    return res.status(200).json({
      message: `Login por OTP ${isOTPEnabled ? 'activado' : 'desactivado'} correctamente`,
      isOTPEnabled: user.isOTPEnabled,
    });
  } catch (error) {
    console.error('Error actualizando OTP:', error);
    throw new AppError('Error al actualizar la preferencia OTP', 500);
  }
};
