// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';


const app = express();

// Middlewares de seguridad y utilidad
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Limitar requests para prevenir ataques
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Ruta raíz de prueba
app.get('/', (req, res) => {
  res.send('🎉 ¡API de rifas funcionando correctamente!');
});

// Rutas
app.use('/api/auth', authRoutes); // ✅ Aquí sí está bien

export default app;
