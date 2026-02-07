import Joi from 'joi';

export const createActividadSchema = Joi.object({
  fase: Joi.string().valid(
    'CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA',
    'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE'
  ).required(),
  tipo: Joi.string().valid('DOCUMENTO', 'REUNION', 'TAREA', 'REVISION', 'OTRO').required(),
  nombre: Joi.string().required(),
  descripcion: Joi.string().allow('', null),
  obligatoria: Joi.boolean().default(false),
  fechaInicio: Joi.date().iso(),
  fechaLimite: Joi.date().iso(),
  
  responsables: Joi.array().items(Joi.number().integer()),
  revisores: Joi.array().items(Joi.number().integer()),
  participantes: Joi.array().items(Joi.number().integer()),

  // 🔥 AGREGAR ESTO: Validación para el array de requisitos
  requisitos: Joi.array().items(
    Joi.object({
      nombre: Joi.string().required(),
      descripcion: Joi.string().allow('', null),
      obligatorio: Joi.boolean().default(true)
    })
  ).optional()
});

export const updateActividadSchema = Joi.object({
  nombre: Joi.string(),
  descripcion: Joi.string().allow('', null),
  fechaLimite: Joi.date().iso(),
  observaciones: Joi.string().allow('', null)
}).min(1);

// export const changeEstadoActividadSchema = Joi.object({
//   nuevoEstado: Joi.string().valid('EN_PROGRESO', 'EN_REVISION', 'OBSERVADA', 'APROBADA', 'RECHAZADA').required(),
//   observaciones: Joi.string().allow('', null)
// });

export const changeEstadoActividadSchema = Joi.object({
  nuevoEstado: Joi.string().valid(
    'EN_PROGRESO',
    'EN_REVISION',
    'OBSERVADA',
    'LISTA_PARA_CIERRE',  // 🔥 AGREGAR
    'RECHAZADA'
    // 🔥 REMOVER 'APROBADA' - solo via endpoint dedicado
  ).required(),
  observaciones: Joi.string().allow('', null)
});

export const assignUsuarioActividadSchema = Joi.object({
  usuarioId: Joi.number().integer().required(),
  rol: Joi.string().valid('RESPONSABLE', 'REVISOR', 'PARTICIPANTE').required()
});

export const listActividadesQuerySchema = Joi.object({
  fase: Joi.string().valid(
    'CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA',
    'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE'
  ),
  estado: Joi.string().valid('CREADA', 'EN_PROGRESO', 'EN_REVISION', 'OBSERVADA', 'APROBADA', 'RECHAZADA'),
  tipo: Joi.string().valid('DOCUMENTO', 'REUNION', 'TAREA', 'REVISION', 'OTRO'),
  responsableId: Joi.number().integer(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});