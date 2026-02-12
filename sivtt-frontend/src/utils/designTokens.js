/**
 * SIVTT Design Tokens
 * Constantes de diseño para uso en componentes React.
 * Centraliza colores de estado, fases, y helpers de estilo.
 */

// ══════════════════════════════════════════════════════════════
// ESTADOS DE PROCESO — Colores y labels
// ══════════════════════════════════════════════════════════════
export const ESTADO_PROCESO_STYLES = {
  ACTIVO: {
    label: 'Activo',
    className: 'badge-activo',
    dotColor: 'bg-emerald-500',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-800/40',
  },
  PAUSADO: {
    label: 'Pausado',
    className: 'badge-pausado',
    dotColor: 'bg-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800/40',
  },
  FINALIZADO: {
    label: 'Finalizado',
    className: 'badge-finalizado',
    dotColor: 'bg-sky-500',
    bgClass: 'bg-sky-50 dark:bg-sky-950/30',
    textClass: 'text-sky-700 dark:text-sky-400',
    borderClass: 'border-sky-200 dark:border-sky-800/40',
  },
  CANCELADO: {
    label: 'Cancelado',
    className: 'badge-cancelado',
    dotColor: 'bg-rose-500',
    bgClass: 'bg-rose-50 dark:bg-rose-950/30',
    textClass: 'text-rose-700 dark:text-rose-400',
    borderClass: 'border-rose-200 dark:border-rose-800/40',
  },
  ARCHIVADO: {
    label: 'Archivado',
    className: 'badge-archivado',
    dotColor: 'bg-slate-400 dark:bg-slate-500',
    bgClass: 'bg-slate-100 dark:bg-slate-800/40',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-200 dark:border-slate-700/40',
  },
};

// ══════════════════════════════════════════════════════════════
// ESTADOS DE ACTIVIDAD
// ══════════════════════════════════════════════════════════════
export const ESTADO_ACTIVIDAD_STYLES = {
  CREADA: {
    label: 'Creada',
    bgClass: 'bg-slate-100 dark:bg-slate-800/40',
    textClass: 'text-slate-600 dark:text-slate-400',
    borderClass: 'border-slate-200 dark:border-slate-700/40',
  },
  EN_PROGRESO: {
    label: 'En progreso',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderClass: 'border-blue-200 dark:border-blue-800/40',
  },
  EN_REVISION: {
    label: 'En revisión',
    bgClass: 'bg-violet-50 dark:bg-violet-950/30',
    textClass: 'text-violet-700 dark:text-violet-400',
    borderClass: 'border-violet-200 dark:border-violet-800/40',
  },
  OBSERVADA: {
    label: 'Observada',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderClass: 'border-amber-200 dark:border-amber-800/40',
  },
  LISTA_PARA_CIERRE: {
    label: 'Lista para cierre',
    bgClass: 'bg-teal-50 dark:bg-teal-950/30',
    textClass: 'text-teal-700 dark:text-teal-400',
    borderClass: 'border-teal-200 dark:border-teal-800/40',
  },
  APROBADA: {
    label: 'Aprobada',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    borderClass: 'border-emerald-200 dark:border-emerald-800/40',
  },
  RECHAZADA: {
    label: 'Rechazada',
    bgClass: 'bg-rose-50 dark:bg-rose-950/30',
    textClass: 'text-rose-700 dark:text-rose-400',
    borderClass: 'border-rose-200 dark:border-rose-800/40',
  },
};

// ══════════════════════════════════════════════════════════════
// FASES DE VINCULACIÓN — Colores asignados por fase
// ══════════════════════════════════════════════════════════════
export const FASE_STYLES = {
  CARACTERIZACION: {
    label: 'Caracterización',
    color: '#6366f1',       // Indigo 500
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/30',
    textClass: 'text-indigo-700 dark:text-indigo-400',
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
  },
  ENRIQUECIMIENTO: {
    label: 'Enriquecimiento',
    color: '#8b5cf6',       // Violet 500
    bgClass: 'bg-violet-50 dark:bg-violet-950/30',
    textClass: 'text-violet-700 dark:text-violet-400',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
  },
  MATCH: {
    label: 'Match',
    color: '#06b6d4',       // Cyan 500
    bgClass: 'bg-cyan-50 dark:bg-cyan-950/30',
    textClass: 'text-cyan-700 dark:text-cyan-400',
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
  },
  ESCALAMIENTO: {
    label: 'Escalamiento',
    color: '#0ea5e9',       // Sky 500
    bgClass: 'bg-sky-50 dark:bg-sky-950/30',
    textClass: 'text-sky-700 dark:text-sky-400',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40',
  },
  TRANSFERENCIA: {
    label: 'Transferencia',
    color: '#10b981',       // Emerald 500
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  FORMULACION_RETO: {
    label: 'Formulación de reto',
    color: '#f59e0b',       // Amber 500
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
  },
  CONVOCATORIA: {
    label: 'Convocatoria',
    color: '#f97316',       // Orange 500
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    textClass: 'text-orange-700 dark:text-orange-400',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40',
  },
  POSTULACION: {
    label: 'Postulación',
    color: '#ec4899',       // Pink 500
    bgClass: 'bg-pink-50 dark:bg-pink-950/30',
    textClass: 'text-pink-700 dark:text-pink-400',
    iconBg: 'bg-pink-100 dark:bg-pink-900/40',
  },
  SELECCION: {
    label: 'Selección',
    color: '#a855f7',       // Purple 500
    bgClass: 'bg-purple-50 dark:bg-purple-950/30',
    textClass: 'text-purple-700 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/40',
  },
  ANTEPROYECTO: {
    label: 'Anteproyecto',
    color: '#14b8a6',       // Teal 500
    bgClass: 'bg-teal-50 dark:bg-teal-950/30',
    textClass: 'text-teal-700 dark:text-teal-400',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
  },
  EJECUCION: {
    label: 'Ejecución',
    color: '#3b82f6',       // Blue 500
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
  },
  CIERRE: {
    label: 'Cierre',
    color: '#22c55e',       // Green 500
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    textClass: 'text-green-700 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
  },
};

// ══════════════════════════════════════════════════════════════
// ESTADOS DE EVIDENCIA
// ══════════════════════════════════════════════════════════════
export const ESTADO_EVIDENCIA_STYLES = {
  PENDIENTE: {
    label: 'Pendiente',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
  },
  APROBADA: {
    label: 'Aprobada',
    bgClass: 'bg-emerald-50 dark:bg-emerald-950/30',
    textClass: 'text-emerald-700 dark:text-emerald-400',
  },
  RECHAZADA: {
    label: 'Rechazada',
    bgClass: 'bg-rose-50 dark:bg-rose-950/30',
    textClass: 'text-rose-700 dark:text-rose-400',
  },
};

// ══════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════

/**
 * Genera clases para un badge de estado genérico.
 * @param {string} estado - Clave del estado
 * @param {object} styleMap - Mapa de estilos (ej: ESTADO_PROCESO_STYLES)
 * @returns {string} Clases CSS combinadas
 */
export function getStatusBadgeClasses(estado, styleMap) {
  const style = styleMap[estado];
  if (!style) return 'bg-muted text-muted-foreground';
  return `${style.bgClass} ${style.textClass} ${style.borderClass || ''}`.trim();
}

/**
 * Obtiene el label legible de un estado.
 */
export function getStatusLabel(estado, styleMap) {
  return styleMap[estado]?.label || estado;
}

/**
 * Clases para el dot indicator de un estado de proceso.
 */
export function getStatusDotClass(estado) {
  return ESTADO_PROCESO_STYLES[estado]?.dotColor || 'bg-slate-400';
}