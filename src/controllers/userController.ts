import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { comparePassword, hashPassword } from '../utils/helpers'
import { addToBlacklist } from "../services/blacklist.service";
import { blacklistTokenSchema } from "../schemas/tokenBlacklist.schema";

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

// src/controllers/UserController.ts
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) throw new AppError('La contraseña actual es incorrecta', 401);

    user.password = await hashPassword(newPassword);
    await user.save();

    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token no enviado" });
    }

    const token = authHeader.split(" ")[1];

    // Validar con Zod
    blacklistTokenSchema.parse({ token });

    // Agregar a la blacklist
    await addToBlacklist(token);

    return res.status(200).json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({ message: "Error al cerrar sesión" });
  }
};