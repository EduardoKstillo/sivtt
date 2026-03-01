// ============================================================
// Catálogo de permisos — deben coincidir exactamente con el seed
// ============================================================

export const PERMISOS = {
  // SISTEMA
  VER_TODO:           'ver:todo',
  GESTIONAR_USUARIOS: 'gestionar:usuarios',
  VER_USUARIOS:       'ver:usuarios',
  GESTIONAR_ROLES:    'gestionar:roles',
  VER_ROLES:          'ver:roles',

  // PROCESO
  VER_PROCESO:        'ver:proceso',
  EDITAR_PROCESO:     'editar:proceso',
  CREAR_FASE:         'crear:fase',

  // ACTIVIDAD
  VER_ACTIVIDAD:      'ver:actividad',
  CREAR_ACTIVIDAD:    'crear:actividad',
  EDITAR_ACTIVIDAD:   'editar:actividad',
  ELIMINAR_ACTIVIDAD: 'eliminar:actividad',

  // EVIDENCIAS
  SUBIR_EVIDENCIA:    'subir:evidencia',
  APROBAR_EVIDENCIA:  'aprobar:evidencia',
  RECHAZAR_EVIDENCIA: 'rechazar:evidencia',

  // CONVOCATORIAS
  VER_CONVOCATORIAS:     'ver:convocatorias',
  POSTULAR_CONVOCATORIA: 'postular:convocatoria',
}

// ============================================================
// Roles de sistema (ámbito SISTEMA)
// ============================================================

export const ROLES = {
  ADMIN_SISTEMA:    'ADMIN_SISTEMA',
  OBSERVADOR:       'OBSERVADOR',
  INVESTIGADOR:     'INVESTIGADOR',
}

// ============================================================
// Helpers que trabajan directamente con el user del store
// Úsalos cuando necesites lógica fuera de componentes React
// ============================================================

/**
 * Verifica si un usuario tiene un permiso específico.
 * ADMIN_SISTEMA siempre retorna true.
 */
export const userHasPermission = (user, permiso) => {
  if (!user) return false
  if (user.roles?.includes(ROLES.ADMIN_SISTEMA)) return true
  return user.permisos?.includes(permiso) ?? false
}

/**
 * Verifica si un usuario tiene AL MENOS UNO de los permisos dados.
 */
export const userHasAnyPermission = (user, permisos) => {
  return permisos.some(p => userHasPermission(user, p))
}

/**
 * Verifica si un usuario tiene un rol de sistema específico.
 */
export const userHasRole = (user, role) => {
  if (!user?.roles) return false
  return user.roles.includes(role)
}

// ============================================================
// Configuración de visibilidad del menú sidebar
// Cada ítem define qué permiso se necesita para verlo
// ============================================================

export const MENU_PERMISSIONS = {
  dashboard:      null,                         // accesible a todos
  procesos:       PERMISOS.VER_PROCESO,
  empresas:       PERMISOS.VER_PROCESO,
  grupos:         PERMISOS.VER_CONVOCATORIAS,
  convocatorias:  PERMISOS.VER_CONVOCATORIAS,
  usuarios:       PERMISOS.VER_USUARIOS,
}