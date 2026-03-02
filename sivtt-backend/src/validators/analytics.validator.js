import Joi from 'joi';

export const analyticsQuerySchema = Joi.object({
  tipoActivo: Joi.string().valid('PATENTE', 'REQUERIMIENTO_EMPRESARIAL'),
  fase: Joi.string(),
  periodo: Joi.string().valid('ultimo_mes', 'ultimo_trimestre', 'ultimo_semestre', 'ultimo_ano', 'todo'),
  limit: Joi.number().integer().min(1).max(100)
});