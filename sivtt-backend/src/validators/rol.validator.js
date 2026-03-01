import Joi from 'joi';

const AMBITOS_VALIDOS = ['SISTEMA', 'PROCESO', 'ACTIVIDAD', 'EMPRESA'];

export const createRolSchema = Joi.object({
  nombre: Joi.string().trim().min(3).max(100).required().messages({
    'any.required': 'El nombre es requerido',
    'string.min': 'El nombre debe tener al menos 3 caracteres'
  }),
  codigo: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_]+$/)
    .min(3)
    .max(50)
    .required()
    .messages({
      'any.required': 'El código es requerido',
      'string.pattern.base': 'El código solo puede contener letras mayúsculas, números y guiones bajos'
    }),
  ambito: Joi.string()
    .valid(...AMBITOS_VALIDOS)
    .required()
    .messages({
      'any.required': 'El ámbito es requerido',
      'any.only': `El ámbito debe ser uno de: ${AMBITOS_VALIDOS.join(', ')}`
    }),
  descripcion: Joi.string().trim().max(500).optional().allow('', null),
  permisos: Joi.array().items(Joi.number().integer().positive()).optional().default([])
});

export const updateRolSchema = Joi.object({
  nombre: Joi.string().trim().min(3).max(100).optional(),
  codigo: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9_]+$/)
    .min(3)
    .max(50)
    .optional(),
  descripcion: Joi.string().trim().max(500).optional().allow('', null),
  activo: Joi.boolean().optional(),
  // Si se incluye permisos, se reemplazan completamente (sync)
  permisos: Joi.array().items(Joi.number().integer().positive()).optional()
}).min(1);

export const toggleEstadoRolSchema = Joi.object({
  activo: Joi.boolean().required()
});

// ==========================================
// PERMISOS
// ==========================================

export const createPermisoSchema = Joi.object({
  codigo: Joi.string()
    .trim()
    .pattern(/^[a-z_:]+$/)
    .min(3)
    .max(100)
    .required()
    .messages({
      'any.required': 'El código es requerido',
      'string.pattern.base': 'El código debe usar formato snake_case con ":" (ej: crear:proceso, aprobar:evidencia)'
    }),
  modulo: Joi.string()
    .trim()
    .uppercase()
    .max(50)
    .required()
    .messages({
      'any.required': 'El módulo es requerido'
    }),
  descripcion: Joi.string().trim().max(500).optional().allow('', null)
});

export const updatePermisoSchema = Joi.object({
  codigo: Joi.string()
    .trim()
    .pattern(/^[a-z_:]+$/)
    .min(3)
    .max(100)
    .optional(),
  modulo: Joi.string().trim().uppercase().max(50).optional(),
  descripcion: Joi.string().trim().max(500).optional().allow('', null)
}).min(1);

// ==========================================
// ASIGNACIÓN PERMISOS ↔ ROLES
// ==========================================

export const assignPermisosSchema = Joi.object({
  permisoIds: Joi.array()
    .items(Joi.number().integer().positive())
    .min(1)
    .required()
    .messages({
      'any.required': 'Se requiere al menos un permiso',
      'array.min': 'Se requiere al menos un permiso'
    })
});

export const syncPermisosSchema = Joi.object({
  permisoIds: Joi.array()
    .items(Joi.number().integer().positive())
    .required()
    .messages({
      'any.required': 'permisoIds es requerido (puede ser array vacío para remover todos)'
    })
});

export const listRolesQuerySchema = Joi.object({
  ambito: Joi.string().valid(...AMBITOS_VALIDOS).optional(),
  search: Joi.string().allow('').optional(),
  includeInactive: Joi.string().valid('true', 'false').optional()
});

export const listPermisosQuerySchema = Joi.object({
  modulo: Joi.string().uppercase().optional(),
  search: Joi.string().allow('').optional()
});