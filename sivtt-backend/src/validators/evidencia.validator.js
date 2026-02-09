import Joi from 'joi';

export const createEvidenciaSchema = Joi.object({
  tipoEvidencia: Joi.string().valid('DOCUMENTO', 'IMAGEN', 'VIDEO', 'ACTA', 'INFORME', 'PRESENTACION', 'OTRO').required(),
  descripcion: Joi.string().allow('', null),
  requisitoId: Joi.alternatives().try(Joi.string(), Joi.number()).optional()
});

export const reviewEvidenciaSchema = Joi.object({
  nuevoEstado: Joi.string().valid('APROBADA', 'RECHAZADA').required(),
  comentarioRevision: Joi.string().when('nuevoEstado', {
    is: 'RECHAZADA',
    then: Joi.required(),
    otherwise: Joi.allow('', null)
  })
});

export const listEvidenciasQuerySchema = Joi.object({
  fase: Joi.string().valid(
    'CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA',
    'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE'
  ),
  tipo: Joi.string().valid('DOCUMENTO', 'IMAGEN', 'VIDEO', 'ACTA', 'INFORME', 'PRESENTACION', 'OTRO'),
  estado: Joi.string().valid('PENDIENTE', 'APROBADA', 'RECHAZADA'),
  actividadId: Joi.number().integer(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50)
});