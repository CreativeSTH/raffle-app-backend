import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/AppError';

dotenv.config();

interface JwtPayload {
  id: string;
}

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not set');

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.userId = payload.id;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    throw new AppError('Invalid or expired token', 401);
  }
};
