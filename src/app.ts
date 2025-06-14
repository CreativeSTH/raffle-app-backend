import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/errorHandler';


const app = express();

// Middlewares de seguridad y utilidad
app.use(helmet());

//Configuración avanzada de CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://tu-dominio-en-produccion.com'
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No autorizado por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

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
app.use('/api/auth', authRoutes);
app.use(errorHandler);

export default app;
