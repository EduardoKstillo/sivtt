import { ValidationError } from '../utils/errors.js';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(new ValidationError('Datos de entrada inválidos', details));
    }

    req.validatedData = value;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(new ValidationError('Parámetros de consulta inválidos', details));
    }

    req.validatedQuery = value;
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    console.log('VALIDATING PARAMS:', req.params);

    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return next(new ValidationError('Parámetros inválidos', details));
    }

    req.validatedParams = value;
    next();
  };
};