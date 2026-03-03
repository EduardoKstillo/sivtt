import Joi from 'joi';

export const createProcesoSchema = Joi.object({
  tipoActivo: Joi.string().valid('PATENTE', 'REQUERIMIENTO_EMPRESARIAL').required(),
  sistemaOrigen: Joi.string().required(),
  evaluacionId: Joi.number().integer().required(),
  titulo: Joi.string().required(),
  descripcion: Joi.string().allow('', null),
  trlInicial: Joi.number().integer().min(1).max(9).when('tipoActivo', {
    is: 'PATENTE',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  responsableId: Joi.number().integer().required(),
  // ✅ rolId integer apuntando a un Rol con ambito PROCESO
  // El service valida que el rol exista y sea de ámbito PROCESO
  /* rolId: Joi.number().integer().positive().required().messages({
    'any.required': 'rolId es requerido (debe ser un Rol con ámbito PROCESO)'
  }) */
});

export const updateProcesoSchema = Joi.object({
  titulo: Joi.string(),
  descripcion: Joi.string().allow('', null),
  trlActual: Joi.number().integer().min(1).max(9)
}).min(1);

export const changeEstadoSchema = Joi.object({
  nuevoEstado: Joi.string().valid('ACTIVO', 'PAUSADO', 'FINALIZADO', 'CANCELADO').required(),
  motivo: Joi.string().min(10).required()
});

export const updateTRLSchema = Joi.object({
  nuevoTRL: Joi.number().integer().min(1).max(9).required(),
  justificacion: Joi.string().min(10).required()
});

// ✅ Reemplaza rolProceso string por rolId integer
export const assignUsuarioSchema = Joi.object({
  usuarioId: Joi.number().integer().positive().required(),
  rolId: Joi.number().integer().positive().required().messages({
    'any.required': 'rolId es requerido. Debe corresponder a un Rol con ámbito PROCESO'
  })
});

export const listProcesosQuerySchema = Joi.object({
  tipoActivo: Joi.string().valid('PATENTE', 'REQUERIMIENTO_EMPRESARIAL'),
  estado: Joi.string().valid('ACTIVO', 'PAUSADO', 'FINALIZADO', 'CANCELADO', 'ARCHIVADO'),
  faseActual: Joi.string().valid(
    'CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA',
    'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE'
  ),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().min(3).allow('')
});