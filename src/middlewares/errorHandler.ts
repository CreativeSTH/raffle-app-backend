import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../interfaces/middlewareInterfaces/errorHandler.interface'

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[ERROR]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    message,
    ...(err.details && { details: err.details }),
  });
};
