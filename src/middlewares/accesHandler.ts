import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../constants/userRoles';

export const hasRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }
    const userRole = req.user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: permisos insuficientes',
      });
    }

    next();
  };
};

// Atajos por rol
export const isAdmin = hasRole(UserRole.ADMIN);
export const isSuperAdmin = hasRole(UserRole.SUPERADMIN);
export const isHost = hasRole(UserRole.HOST);
export const isUser = hasRole(UserRole.USER);
