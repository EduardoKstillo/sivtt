import Joi from 'joi';

export const createGrupoSchema = Joi.object({
  codigo: Joi.string().required(),
  nombre: Joi.string().required(),
  facultad: Joi.string().required(),
  departamentoAcademico: Joi.string().allow('', null),
  coordinador: Joi.string().required(),
  email: Joi.string().email().required(),
  telefono: Joi.string().allow('', null),
  lineasInvestigacion: Joi.array().items(Joi.string()),
  equipamiento: Joi.object(),
  infraestructura: Joi.string().allow('', null)
});

export const updateGrupoSchema = Joi.object({
  nombre: Joi.string(),
  facultad: Joi.string(),
  departamentoAcademico: Joi.string().allow('', null),
  coordinador: Joi.string(),
  email: Joi.string().email(),
  telefono: Joi.string().allow('', null),
  lineasInvestigacion: Joi.array().items(Joi.string()),
  equipamiento: Joi.object(),
  infraestructura: Joi.string().allow('', null)
}).min(1);

export const addMiembroSchema = Joi.object({
  nombre: Joi.string().required(),
  rol: Joi.string().required(),
  email: Joi.string().email().allow('', null),
  especialidad: Joi.string().allow('', null)
});

export const listGruposQuerySchema = Joi.object({
  search: Joi.string().min(3).allow(''),  // 🔥 Mínimo 3 caracteres
  facultad: Joi.string(),
  activo: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

export const listPostulacionesQuerySchema = Joi.object({
  seleccionado: Joi.boolean().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});