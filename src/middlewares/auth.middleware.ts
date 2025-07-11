import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/AppError';
import { isTokenBlacklisted } from '../services/blacklist.service';
import { UserRole } from '../constants/userRoles';

dotenv.config();

interface JwtPayload {
  id: string;
  role: UserRole;
  email?: string;
}

export interface AuthRequest extends Request {
  userId?: string;
  role: UserRole;
  email?: string;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    // ✅ Verificar si el token está en la blacklist
    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) {
      throw new AppError('Token has been revoked. Please log in again.', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      id: payload.id,
      role: payload.role,
      email: payload.email,
    };
    next();
  } catch (err) {
    console.error('Auth error:', err);
    throw new AppError('Invalid or expired token', 401);
  }
};

export const authTempToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tempToken } = req.body;

    if (!tempToken) {
      return res.status(401).json({ message: 'Token temporal no proporcionado' });
    }

    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET!) as { userId: string };
    req.user = { id: decoded.userId }; // O lo que necesites

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token temporal inválido o expirado' });
  }
};



