import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Asegúrate de importar el modelo User

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as { userId: string };

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }

    req.user = user; // ✅ aquí sí le asignamos el documento de Mongo completo
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Token inválido' });
  }
};
