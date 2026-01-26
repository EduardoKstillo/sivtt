import { Prisma } from '@prisma/client'; // Importante para detectar errores de BD
import { config } from '../config/env.js';
import { errorResponse } from '../utils/responses.js';

export const errorHandler = (err, req, res, next) => {
  // 1. Valores por defecto (manteniendo tu lógica)
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Error interno del servidor';
  let details = err.details || null;

  // 2. Interceptar errores de Prisma (Base de Datos)
  // Prisma no devuelve un 'statusCode', así que si no haces esto, todo será error 500
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      code = 'UNIQUE_CONSTRAINT_VIOLATION';
      // Extrae qué campo causó el error (ej: email, ruc)
      const target = err.meta?.target ? ` (${err.meta.target})` : '';
      message = `Ya existe un registro con ese valor único${target}`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      code = 'RECORD_NOT_FOUND';
      message = 'El registro solicitado no existe';
    } else if (err.code === 'P2003') {
      statusCode = 400;
      code = 'FOREIGN_KEY_CONSTRAINT';
      message = 'Operación denegada por restricciones de relación (el registro está en uso)';
    }
  }

  // 3. Interceptar errores de JWT (Auth)
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'INVALID_TOKEN';
    message = 'Token de autorización inválido';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'El token de autorización ha expirado';
  }

  // 4. Log del error (Tu lógica actual)
  console.error('Error:', {
    message, // Usamos el mensaje procesado
    stack: err.stack,
    codeOriginal: err.code // Guardamos el código original para debug
  });

  // 5. Respuesta (Usando tu utilidad errorResponse)
  res.status(statusCode).json(
    errorResponse(
      message,
      code, // Enviamos un código legible (ej: UNIQUE_CONSTRAINT_VIOLATION)
      config.env === 'development' ? (details || err.meta) : undefined
    )
  );
};

export const notFound = (req, res) => {
  res.status(404).json(
    errorResponse('Ruta no encontrada', 'NOT_FOUND')
  );
};