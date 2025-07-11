import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateParams = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error: any) {
      return res.status(400).json({
        message: 'Parámetros inválidos',
        errors: error.errors,
      });
    }
  };
};
