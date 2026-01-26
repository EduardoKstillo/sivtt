import Joi from 'joi';

/**
 * Esquema para la creación de un nuevo proceso.
 * Define las reglas obligatorias para registrar un activo en el sistema.
 */
export const createProcesoSchema = Joi.object({
  // Solo permite dos tipos específicos de activos
  tipoActivo: Joi.string().valid('PATENTE', 'REQUERIMIENTO_EMPRESARIAL').required(),
  
  sistemaOrigen: Joi.string().required(),
  
  // ID de referencia a otra entidad (Evaluación)
  evaluacionId: Joi.number().integer().required(),
  
  titulo: Joi.string().required(),
  
  // Permite explícitamente que la descripción sea un string vacío o nulo
  descripcion: Joi.string().allow('', null),
  
  /**
   * Lógica Condicional (TRL): 
   * Si es PATENTE, el trlInicial (1-9) es obligatorio.
   * Si es REQUERIMIENTO_EMPRESARIAL, este campo no debe enviarse (forbidden).
   */
  trlInicial: Joi.number().integer().min(1).max(9).when('tipoActivo', {
    is: 'PATENTE',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  
  responsableId: Joi.number().integer().required()
});

/**
 * Esquema para actualizar datos básicos de un proceso.
 */
export const updateProcesoSchema = Joi.object({
  titulo: Joi.string(),
  descripcion: Joi.string().allow('', null),
  trlActual: Joi.number().integer().min(1).max(9)
}).min(1); // .min(1) obliga a que el cuerpo de la petición traiga al menos UN campo para actualizar

/**
 * Esquema para el flujo de estados.
 */
export const changeEstadoSchema = Joi.object({
  nuevoEstado: Joi.string().valid('ACTIVO', 'PAUSADO', 'FINALIZADO', 'CANCELADO').required(),
  // Obliga a que el motivo sea descriptivo (mínimo 10 caracteres)
  motivo: Joi.string().min(10).required()
});

/**
 * Esquema específico para actualizar el nivel de madurez tecnológica (TRL).
 */
export const updateTRLSchema = Joi.object({
  nuevoTRL: Joi.number().integer().min(1).max(9).required(),
  justificacion: Joi.string().min(10).required()
});

/**
 * Esquema para asignar usuarios y roles dentro del proceso.
 */
export const assignUsuarioSchema = Joi.object({
  usuarioId: Joi.number().integer().required(),
  // Solo permite roles predefinidos en el negocio
  rolProceso: Joi.string().valid('RESPONSABLE_PROCESO', 'APOYO', 'OBSERVADOR').required()
});

/**
 * Esquema para validar parámetros de consulta (Query Params) en listados.
 * Muy útil para filtros de búsqueda y paginación.
 */
export const listProcesosQuerySchema = Joi.object({
  tipoActivo: Joi.string().valid('PATENTE', 'REQUERIMIENTO_EMPRESARIAL'),
  estado: Joi.string().valid('ACTIVO', 'PAUSADO', 'FINALIZADO', 'CANCELADO', 'ARCHIVADO'),
  faseActual: Joi.string().valid(
    'CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA',
    'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE'
  ),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().min(3).allow('')  // 🔥 Mínimo 3 caracteres
});