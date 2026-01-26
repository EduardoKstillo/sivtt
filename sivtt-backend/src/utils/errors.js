/**
 * AppError: La clase base. 
 * Hereda de 'Error' para mantener el comportamiento estándar de JS.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'ERROR', details = null) {
    super(message); // Llama al constructor de Error con el mensaje
    
    this.statusCode = statusCode; // Ejemplo: 404, 500, 403
    this.code = code;             // Un string identificador (ej: 'AUTH_FAILED')
    this.details = details;       // Información extra (ej: errores de validación de un formulario)
    
    // Indica que es un error controlado por nosotros y no un bug inesperado del sistema
    this.isOperational = true; 

    // Captura la traza del error (stack trace) sin incluir la llamada al constructor
    // Esto hace que el log sea mucho más limpio y fácil de depurar.
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Clases Especializadas:
 * Heredan de AppError y pre-configuran los códigos HTTP comunes.
 */

// Se usa cuando los datos enviados por el usuario no son válidos (HTTP 422)
export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 422, 'VALIDATION_ERROR', details);
  }
}

// Se usa cuando no se encuentra un registro en la base de datos (HTTP 404)
export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

// Se usa cuando el usuario no está autenticado (HTTP 401)
export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso prohibido') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual') {
    super(message, 409, 'CONFLICT');
  }
}