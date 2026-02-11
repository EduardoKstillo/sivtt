import Joi from 'joi';

export const createEvidenciaSchema = Joi.object({
  // 🔥 AGREGADO: 'ENLACE' a la lista de permitidos
  tipoEvidencia: Joi.string().valid(
    'DOCUMENTO', 'IMAGEN', 'VIDEO', 'ACTA', 'INFORME', 'PRESENTACION', 'OTRO', 'ENLACE'
  ).required(),
  
  descripcion: Joi.string().allow('', null),
  
  // Nombre del archivo o del enlace
  nombreArchivo: Joi.string().optional().allow(''),
  
  // 🔥 AGREGADO: Permitir campo link
  link: Joi.string().uri().optional().allow(''),
  
  // Permitir también urlArchivo por si acaso se envía
  urlArchivo: Joi.string().uri().optional().allow(''),

  // Permitir número o string para el ID
  requisitoId: Joi.alternatives().try(Joi.string(), Joi.number()).optional().allow('extra', 'null', '')
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
  fase: Joi.string().optional(),
  // También aquí agregamos ENLACE por si quieres filtrar por enlaces
  tipo: Joi.string().valid('DOCUMENTO', 'IMAGEN', 'VIDEO', 'ACTA', 'INFORME', 'PRESENTACION', 'OTRO', 'ENLACE'),
  estado: Joi.string().valid('PENDIENTE', 'APROBADA', 'RECHAZADA'),
  actividadId: Joi.alternatives().try(Joi.number(), Joi.string()),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50)
});