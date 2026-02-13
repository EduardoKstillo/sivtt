import Joi from 'joi';

export const createRetoSchema = Joi.object({
  titulo: Joi.string().required(),
  descripcion: Joi.string().required(),
  problema: Joi.string().required(),
  objetivos: Joi.string().allow('', null),
  
  // ✅ CORRECCIÓN: Adaptado al formulario del Frontend (Enfoque Empresarial)
  fichaTecnica: Joi.object({
    empresaSolicitante: Joi.string().allow('', null),
    presupuestoEstimado: Joi.number().allow(null),
    duracionEstimada: Joi.number().integer().allow(null),
    equipoDisponible: Joi.string().allow('', null),
    // Dejamos campos opcionales por si el modelo evoluciona
    tecnologias: Joi.array().items(Joi.string()).optional(),
    entregables: Joi.array().items(Joi.string()).optional()
  }).required(),

  resultadosEsperados: Joi.string().allow('', null),
  restricciones: Joi.string().allow('', null),
  timelineEstimado: Joi.number().integer().min(1).allow(null),
  nivelConfidencialidad: Joi.string().valid('PUBLICO', 'CONFIDENCIAL', 'RESTRINGIDO').default('PUBLICO'),
  prioridad: Joi.number().integer().min(1).max(5).default(3),
  areasAcademicas: Joi.array().items(Joi.string()).default([])
});

export const updateRetoSchema = Joi.object({
  titulo: Joi.string(),
  descripcion: Joi.string(),
  problema: Joi.string(),
  objetivos: Joi.string().allow('', null),
  
  // ✅ CORRECCIÓN: Adaptado para actualización parcial
  fichaTecnica: Joi.object({
    empresaSolicitante: Joi.string().allow('', null),
    presupuestoEstimado: Joi.number().allow(null),
    duracionEstimada: Joi.number().integer().allow(null),
    equipoDisponible: Joi.string().allow('', null),
    tecnologias: Joi.array().items(Joi.string()),
    entregables: Joi.array().items(Joi.string())
  }),

  resultadosEsperados: Joi.string().allow('', null),
  restricciones: Joi.string().allow('', null),
  timelineEstimado: Joi.number().integer().min(1).allow(null),
  nivelConfidencialidad: Joi.string().valid('PUBLICO', 'CONFIDENCIAL', 'RESTRINGIDO'),
  prioridad: Joi.number().integer().min(1).max(5),
  areasAcademicas: Joi.array().items(Joi.string())
}).min(1);