// ============================================================
// Catálogo de permisos — AHORA REFLEJAN EL NUEVO SEED
// ============================================================

export const PERMISOS = {
  // SISTEMA
  ACCESO_BASICO:      'acceso:basico',
  VER_TODO:           'ver:todo',
  VER_DASHBOARD:      'ver:dashboard',
  GESTIONAR_USUARIOS: 'gestionar:usuarios',
  GESTIONAR_ROLES:    'gestionar:roles',
  VER_PROCESOS_GLOBAL:'ver:procesos',
  CREAR_PROCESO:      'crear:proceso',

  // PROCESO
  VER_PROCESO:        'ver:proceso',
  EDITAR_PROCESO:     'editar:proceso',
  GESTIONAR_FASES:    'gestionar:fases',
  ASIGNAR_EQUIPO:     'asignar:equipo',

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
  ADMIN_SISTEMA:          'ADMIN_SISTEMA',
  COORDINADOR_PORTAFOLIO: 'COORDINADOR_PORTAFOLIO',
  OBSERVADOR_GLOBAL:      'OBSERVADOR_GLOBAL',
  USUARIO_ESTANDAR:       'USUARIO_ESTANDAR',
}

// Helpers que trabajan directamente con el user del store
export const userHasPermission = (user, permiso) => {
  if (!user) return false;
  if (user.roles?.includes(ROLES.ADMIN_SISTEMA)) return true;
  return user.permisos?.includes(permiso) ?? false;
}

export const userHasAnyPermission = (user, permisos) => {
  return permisos.some(p => userHasPermission(user, p));
}

export const userHasRole = (user, role) => {
  if (!user?.roles) return false;
  return user.roles.includes(role);
}

// ============================================================
// Configuración de visibilidad del menú sidebar
// Nivel 1: Para ver los módulos padre, usamos ACCESO_BASICO para
// que los usuarios puedan ver el listado (el backend filtrará qué ven).
// ============================================================

export const MENU_PERMISSIONS = {
  dashboard:      PERMISOS.VER_DASHBOARD,
  procesos:       PERMISOS.VER_PROCESOS_GLOBAL, // <--- CAMBIADO
  empresas:       PERMISOS.VER_PROCESOS_GLOBAL, // <--- CAMBIADO
  grupos:         PERMISOS.VER_CONVOCATORIAS,
  convocatorias:  PERMISOS.VER_CONVOCATORIAS,
  usuarios:       PERMISOS.GESTIONAR_USUARIOS,
}