import Joi from 'joi';

export const createDecisionSchema = Joi.object({
  decision: Joi.string().valid(
    'CONTINUAR', 
    'RETROCEDER', 
    'PAUSAR', 
    'CANCELAR', 
    'FINALIZAR', 
    'RELANZAR_CONVOCATORIA'
  ).required(),
  
  justificacion: Joi.string().min(10).required(),
  
  // Para RETROCEDER
  faseDestino: Joi.string().valid(
    'CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA',
    'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE'
  ).when('decision', {
    is: 'RETROCEDER',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),

  // 🔥 NUEVOS CAMPOS para RELANZAR_CONVOCATORIA
  fechaApertura: Joi.date().iso().when('decision', {
    is: 'RELANZAR_CONVOCATORIA',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),

  fechaCierre: Joi.date().iso().greater(Joi.ref('fechaApertura')).when('decision', {
    is: 'RELANZAR_CONVOCATORIA',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),

  modificaciones: Joi.string().optional().allow('').when('decision', {
    is: 'RELANZAR_CONVOCATORIA',
    then: Joi.optional(),
    otherwise: Joi.forbidden()
  })
});

export const listDecisionesQuerySchema = Joi.object({
  fase: Joi.string().valid(
    'CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA',
    'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE'
  ),
  decision: Joi.string().valid('CONTINUAR', 'RETROCEDER', 'PAUSAR', 'CANCELAR', 'FINALIZAR', 'RELANZAR_CONVOCATORIA'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

export const procesoFaseParamsSchema = Joi.object({
  procesoId: Joi.number().integer().required(),
  faseId: Joi.number().integer().required()
});
