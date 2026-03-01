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

  // Arrays de IDs de usuario para asignación masiva al crear
  // El service resuelve los rolId de RESPONSABLE_TAREA y REVISOR_TAREA internamente
  responsables: Joi.array().items(Joi.number().integer().positive()),
  revisores: Joi.array().items(Joi.number().integer().positive()),
  participantes: Joi.array().items(Joi.number().integer().positive()),

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

export const changeEstadoActividadSchema = Joi.object({
  nuevoEstado: Joi.string().valid(
    'EN_PROGRESO',
    'EN_REVISION',
    'OBSERVADA',
    'LISTA_PARA_CIERRE',
    'RECHAZADA'
    // APROBADA solo vía POST /:id/aprobar — nunca desde este endpoint
  ).required(),
  observaciones: Joi.string().allow('', null)
});

// ✅ Reemplaza rol string por rolId integer
// El service valida que sea un Rol con ambito ACTIVIDAD
export const assignUsuarioActividadSchema = Joi.object({
  usuarioId: Joi.number().integer().positive().required(),
  rolId: Joi.number().integer().positive().required().messages({
    'any.required': 'rolId es requerido. Debe corresponder a un Rol con ámbito ACTIVIDAD'
  })
});

export const listActividadesQuerySchema = Joi.object({
  fase: Joi.string().valid(
    'CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA',
    'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE'
  ),
  estado: Joi.string().valid('CREADA', 'EN_PROGRESO', 'EN_REVISION', 'OBSERVADA', 'LISTA_PARA_CIERRE', 'APROBADA', 'RECHAZADA'),
  tipo: Joi.string().valid('DOCUMENTO', 'REUNION', 'TAREA', 'REVISION', 'OTRO'),
  responsableId: Joi.number().integer(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});