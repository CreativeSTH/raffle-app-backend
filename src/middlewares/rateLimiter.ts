import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 intentos por IP en ese periodo
  message: {
    message: 'Demasiados intentos. Por favor intenta nuevamente más tarde.',
  },
  standardHeaders: true, // Devuelve los headers rate limit
  legacyHeaders: false,  // Desactiva X-RateLimit-* headers
});
