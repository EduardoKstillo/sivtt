import Joi from 'joi';

export const idParamSchema = Joi.object({
  id: Joi.number().integer().required()
});

export const procesoIdParamSchema = Joi.object({
  procesoId: Joi.number().integer().required()
});

export const retoIdParamSchema = Joi.object({
  retoId: Joi.number().integer().required()
});

export const convocatoriaIdParamSchema = Joi.object({
  convocatoriaId: Joi.number().integer().required()
});

export const searchQuerySchema = Joi.string().min(3).allow('');

export const actividadIdParamSchema = Joi.object({
  actividadId: Joi.number().integer().required()
});