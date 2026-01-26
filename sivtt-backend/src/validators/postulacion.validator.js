import Joi from 'joi';

export const createPostulacionSchema = Joi.object({
  grupoId: Joi.number().integer().required(),
  convocatoriaId: Joi.number().integer().required(),
  notaInteres: Joi.string().required(),
  capacidadesTecnicas: Joi.string().required(),
  propuestaTecnica: Joi.string().allow('', null),
  cronogramaPropuesto: Joi.object(),
  presupuestoEstimado: Joi.number().min(0),
  equipoDisponible: Joi.object(),
  documentosUrl: Joi.object()
});

export const evaluarPostulacionSchema = Joi.object({
  puntajesDetalle: Joi.object().required(),
  puntajeTotal: Joi.number().min(0).max(100).required(),
  observaciones: Joi.string().allow('', null)
});

export const rechazarPostulacionSchema = Joi.object({
  motivoRechazo: Joi.string().min(10).required()
});

export const listPostulacionesQuerySchema = Joi.object({
  seleccionado: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});