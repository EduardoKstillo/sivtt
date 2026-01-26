import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
// import cookieParser from 'cookie-parser';

import routes from './routes/index.js'; // Tu archivo de rutas
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { NotFoundError } from './utils/errors.js';

const app = express();

// --- 1. Middlewares de Seguridad y Utilidad ---

// Helmet ayuda a proteger la app configurando varios headers HTTP
app.use(helmet());

// Habilitar CORS (Cross-Origin Resource Sharing)
// Ajusta 'origin' con la URL de tu Frontend (ej: http://localhost:5173)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', 
  credentials: true, // Permitir cookies/headers de autorización
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Logger de solicitudes HTTP (solo en desarrollo se ve bonito, en prod más conciso)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parseo de Body (JSON y URL-encoded)
app.use(express.json({ limit: '10mb' })); // Limite aumentado para subir archivos/evidencias
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Parseo de Cookies (necesario si manejas refresh tokens en cookies httpOnly)
// app.use(cookieParser());

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// --- 2. Rutas ---

// Prefijo global /api/v1 para mantener orden y versionado
app.use('/api', routes);

// --- 3. Manejo de Errores ---

// Si la solicitud llega aquí, es que ninguna ruta coincidió (404)
app.use((req, res, next) => {
  next(new NotFoundError(`La ruta ${req.originalUrl} no existe`));
});

// Middleware Global de Errores (Intercepta los next(error) de los controladores)
app.use(notFound);     // Maneja el 404
app.use(errorHandler); // Maneja los errores

export default app;