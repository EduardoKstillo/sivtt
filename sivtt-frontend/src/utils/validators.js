import { TRANSICIONES_ACTIVIDAD, TRL_RANGES } from './constants'

/**
 * Valida si una transición de estado de actividad es válida
 */
export const isValidActivityTransition = (currentState, newState) => {
  const validTransitions = TRANSICIONES_ACTIVIDAD[currentState] || []
  return validTransitions.includes(newState)
}

/**
 * Valida si el TRL es coherente con la fase
 */
export const isValidTRLForPhase = (fase, trl) => {
  const range = TRL_RANGES[fase]
  if (!range) return true // Fases sin TRL (requerimientos)
  return trl >= range.min && trl <= range.max
}

/**
 * Valida si se puede cerrar una fase
 */
export const canCloseFase = (actividades = []) => {
  if (!actividades || actividades.length === 0) return true; // Si no hay actividades, se puede cerrar

  // Filtramos las obligatorias
  const obligatorias = actividades.filter(act => act.obligatoria);

  // Verificamos que TODAS las obligatorias estén APROBADAS
  const todasAprobadas = obligatorias.every(act => act.estado === 'APROBADA');

  return todasAprobadas;
}

/**
 * Valida si se puede aprobar una actividad
 */
export const canApproveActividad = (actividad) => {
  if (actividad.estado !== 'LISTA_PARA_CIERRE') return false
  
  const { evidencias } = actividad
  if (!evidencias) return true
  
  return evidencias.pendientes === 0 && evidencias.rechazadas === 0
}

/**
 * Valida si se puede seleccionar una postulación como ganadora
 */
export const canSelectPostulacion = (postulacion, criterios) => {
  if (!postulacion.puntajeTotal) return false
  if (!postulacion.fechaEvaluacion) return false
  
  const puntajeMinimo = criterios?.puntajeMinimo || 0
  return postulacion.puntajeTotal >= puntajeMinimo
}

/**
 * Valida datos de creación de proceso
 */
export const validateProcesoCreate = (data) => {
  const errors = {}
  
  if (!data.tipoActivo) {
    errors.tipoActivo = 'El tipo de activo es obligatorio'
  }
  
  if (!data.sistemaOrigen || data.sistemaOrigen.trim() === '') {
    errors.sistemaOrigen = 'El sistema de origen es obligatorio'
  }
  
  if (!data.evaluacionId || isNaN(data.evaluacionId) || data.evaluacionId <= 0) {
    errors.evaluacionId = 'El ID de evaluación debe ser un número válido'
  }
  
  if (!data.titulo || data.titulo.trim().length < 10) {
    errors.titulo = 'El título debe tener al menos 10 caracteres'
  }
  
  if (data.tipoActivo === 'PATENTE' && (!data.trlInicial || data.trlInicial < 1 || data.trlInicial > 9)) {
    errors.trlInicial = 'El TRL inicial debe estar entre 1 y 9'
  }
  
  if (!data.responsableId) {
    errors.responsableId = 'El responsable es obligatorio'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}