import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errorMessage = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      throw new AppError(`Validación fallida: ${errorMessage}`, 400);
    }

    // Sobrescribe req.body con los datos validados
    req.body = result.data;
    next();
  };
};
