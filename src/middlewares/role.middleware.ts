import { Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthRequest } from './auth.middleware';
import { AppError } from '../utils/AppError';

export const permit =
  (...allowedRoles: string[]) =>
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const user = await User.findById(userId);
      if (!user || !allowedRoles.includes(user.role)) {
        throw new AppError('Forbidden: insufficient rights', 403);
      }

      next();
    } catch (err) {
      console.error('Role check error:', err);
      throw new AppError('Internal server error', 500);
    }
  };
