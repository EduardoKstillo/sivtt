import Joi from 'joi';

export const createUsuarioSchema = Joi.object({
  nombres: Joi.string().required(),
  apellidos: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  roles: Joi.array().items(Joi.number().integer()).min(1).required()
});

export const updateUsuarioSchema = Joi.object({
  nombres: Joi.string(),
  apellidos: Joi.string(),
  email: Joi.string().email()
}).min(1);

export const changePasswordSchema = Joi.object({
  passwordActual: Joi.string().required(),
  passwordNueva: Joi.string().min(6).required()
});

export const toggleEstadoSchema = Joi.object({
  activo: Joi.boolean().required()
});

export const assignRolSchema = Joi.object({
  rolId: Joi.number().integer().required()
});

export const listUsuariosQuerySchema = Joi.object({
  search: Joi.string().allow('').optional(),
  
  // CORRECCIÓN 1: Cambiar 'rol' a 'roles' para coincidir con el Frontend
  // CORRECCIÓN 2: Quitar .valid() estricto para permitir "ROL1,ROL2"
  roles: Joi.string().optional(), 
  
  // CORRECCIÓN 3: Joi convierte 'true'/'false' a Boolean automáticamente
  activo: Joi.boolean().optional(),
  
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});