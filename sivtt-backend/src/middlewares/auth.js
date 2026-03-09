/* import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import prisma from '../config/database.js';

// ==========================================
// AUTENTICACIÓN
// ==========================================

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token no proporcionado');
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: {
        roles: {
          where: { rol: { ambito: 'SISTEMA', activo: true } },
          include: {
            rol: { include: { permisos: { include: { permiso: true } } } }
          }
        }
      }
    });

    if (!usuario || !usuario.activo || usuario.deletedAt) {
      throw new UnauthorizedError('Usuario no encontrado o inactivo');
    }

    const permisosSet = new Set();
    const rolesSet = new Set();

    for (const ur of usuario.roles) {
      rolesSet.add(ur.rol.codigo);
      for (const rp of ur.rol.permisos) {
        permisosSet.add(rp.permiso.codigo);
      }
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      roles: Array.from(rolesSet),
      permisos: Array.from(permisosSet)
    };

    next();
  } catch (error) {
    next(error);
  }
};

// ==========================================
// AUTORIZACIÓN POR ROL (compatibilidad)
// Mantiene la firma anterior: authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION')
// ==========================================

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return next(new UnauthorizedError());

    const isAdmin = req.user.roles.includes('ADMIN_SISTEMA');
    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

    if (!isAdmin && !hasRole) {
      return next(new ForbiddenError('No tiene los roles necesarios para realizar esta acción'));
    }

    next();
  };
};

// ==========================================
// AUTORIZACIÓN POR PERMISO (nuevo sistema RBAC)
// Uso: requirePermission('aprobar:evidencia')
// ==========================================

export const requirePermission = (...requiredPermisos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(new UnauthorizedError());

      // 1. ADMIN_SISTEMA tiene acceso total
      if (req.user.roles.includes('ADMIN_SISTEMA')) return next();

      const permisosAcumulados = new Set(req.user.permisos);

      // 2. Verificación rápida si ya tiene el permiso a nivel SISTEMA
      let hasPermission = requiredPermisos.some(p => permisosAcumulados.has(p));
      if (hasPermission) return next();

      // Función helper para agregar permisos encontrados en BD
      const agregarPermisosContextuales = (vinculacion) => {
        if (vinculacion?.rol?.permisos) {
          vinculacion.rol.permisos.forEach(rp => permisosAcumulados.add(rp.permiso.codigo));
        }
      };

      // 3. Extraer contexto de la URL
      const isProcesosRoute = req.originalUrl.includes('/procesos');
      const isActividadesRoute = req.originalUrl.includes('/actividades');
      const isEvidenciasRoute = req.originalUrl.includes('/evidencias');

      // Identificar IDs según el endpoint
      let procesoId = req.params.procesoId ? parseInt(req.params.procesoId) : (isProcesosRoute && req.params.id ? parseInt(req.params.id) : null);
      let actividadId = req.params.actividadId ? parseInt(req.params.actividadId) : (isActividadesRoute && req.params.id ? parseInt(req.params.id) : null);
      let evidenciaId = isEvidenciasRoute && req.params.id ? parseInt(req.params.id) : null;

      // 4. Buscar permisos de PROCESO
      if (procesoId) {
        const vinculacionProceso = await prisma.procesoUsuario.findFirst({
          where: { usuarioId: req.user.id, procesoId, rol: { activo: true } },
          include: { rol: { include: { permisos: { include: { permiso: true } } } } }
        });
        agregarPermisosContextuales(vinculacionProceso);
      }

      // 5. Buscar permisos de ACTIVIDAD
      if (actividadId) {
        const vinculacionActividad = await prisma.usuarioActividad.findFirst({
          where: { usuarioId: req.user.id, actividadId, rol: { activo: true } },
          include: { rol: { include: { permisos: { include: { permiso: true } } } } }
        });
        agregarPermisosContextuales(vinculacionActividad);
      }

      // 6. Buscar permisos desde EVIDENCIA (hereda permisos de la actividad padre)
      if (evidenciaId && !actividadId) {
        const evidencia = await prisma.evidenciaActividad.findUnique({
          where: { id: evidenciaId },
          select: { actividadId: true }
        });
        if (evidencia) {
          const vinculacionEvidencia = await prisma.usuarioActividad.findFirst({
            where: { usuarioId: req.user.id, actividadId: evidencia.actividadId, rol: { activo: true } },
            include: { rol: { include: { permisos: { include: { permiso: true } } } } }
          });
          agregarPermisosContextuales(vinculacionEvidencia);
        }
      }

      // 7. Volver a evaluar con todos los permisos (Sistema + Proceso + Actividad) sumados
      hasPermission = requiredPermisos.some(p => permisosAcumulados.has(p));

      if (!hasPermission) {
        return next(
          new ForbiddenError(`Se requiere uno de los siguientes permisos: ${requiredPermisos.join(', ')}`)
        );
      }

      // Guardamos los permisos extendidos en req.user por si controladores posteriores los usan
      req.user.permisos = Array.from(permisosAcumulados);
      next();

    } catch (error) {
      next(error);
    }
  };
};

// ==========================================
// AUTORIZACIÓN A NIVEL DE PROCESO
// Verifica si el usuario tiene un rol específico dentro de un proceso
// Uso: requireRolEnProceso('GESTOR_PROCESO', 'REVISOR_PROCESO')
// ==========================================

export const requireRolEnProceso = (...rolesRequeridos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError());
      }

      // ADMIN_SISTEMA tiene acceso total
      if (req.user.roles.includes('ADMIN_SISTEMA')) {
        return next();
      }

      const procesoId = parseInt(req.params.procesoId || req.params.id);

      if (!procesoId) {
        return next(new ForbiddenError('No se pudo determinar el proceso para verificar permisos'));
      }

      // Buscar si el usuario tiene alguno de los roles requeridos en este proceso
      const vinculacion = await prisma.procesoUsuario.findFirst({
        where: {
          usuarioId: req.user.id,
          procesoId,
          rol: {
            codigo: { in: rolesRequeridos },
            activo: true
          }
        },
        include: {
          rol: {
            include: {
              permisos: {
                include: { permiso: true }
              }
            }
          }
        }
      });

      if (!vinculacion) {
        return next(
          new ForbiddenError('No tiene los permisos necesarios en este proceso')
        );
      }

      // Enriquecer req.user con permisos del rol en este proceso
      const permisosProcesoSet = new Set(req.user.permisos);
      for (const rp of vinculacion.rol.permisos) {
        permisosProcesoSet.add(rp.permiso.codigo);
      }

      req.user.permisos = Array.from(permisosProcesoSet);
      req.user.rolEnProceso = vinculacion.rol.codigo;

      next();
    } catch (error) {
      next(error);
    }
  };
};

// ==========================================
// AUTORIZACIÓN A NIVEL DE ACTIVIDAD
// Verifica si el usuario tiene un rol específico asignado en una actividad
// Uso: requireRolEnActividad('EJECUTOR', 'REVISOR')
// ==========================================

export const requireRolEnActividad = (...rolesRequeridos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new UnauthorizedError());
      }

      if (req.user.roles.includes('ADMIN_SISTEMA')) {
        return next();
      }

      const actividadId = parseInt(req.params.actividadId || req.params.id);

      if (!actividadId) {
        return next(new ForbiddenError('No se pudo determinar la actividad para verificar permisos'));
      }

      const vinculacion = await prisma.usuarioActividad.findFirst({
        where: {
          usuarioId: req.user.id,
          actividadId,
          rol: {
            codigo: { in: rolesRequeridos },
            activo: true
          }
        },
        include: {
          rol: {
            include: {
              permisos: {
                include: { permiso: true }
              }
            }
          }
        }
      });

      if (!vinculacion) {
        return next(
          new ForbiddenError('No tiene los permisos necesarios en esta actividad')
        );
      }

      const permisosActividadSet = new Set(req.user.permisos);
      for (const rp of vinculacion.rol.permisos) {
        permisosActividadSet.add(rp.permiso.codigo);
      }

      req.user.permisos = Array.from(permisosActividadSet);
      req.user.rolEnActividad = vinculacion.rol.codigo;

      next();
    } catch (error) {
      next(error);
    }
  };
}; */

import { verifyAccessToken } from '../utils/jwt.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import prisma from '../config/database.js';

// ==========================================
// 1. AUTENTICACIÓN (Nivel 0: ¿Quién eres?)
// ==========================================
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) throw new UnauthorizedError('Token no proporcionado');

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    // Buscamos SOLO sus roles globales (SISTEMA)
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: {
        roles: {
          where: { rol: { ambito: 'SISTEMA', activo: true } },
          include: { rol: { include: { permisos: { include: { permiso: true } } } } }
        }
      }
    });

    if (!usuario || !usuario.activo || usuario.deletedAt) throw new UnauthorizedError('Usuario inactivo');

    const permisosSet = new Set();
    const rolesSet = new Set();

    for (const ur of usuario.roles) {
      rolesSet.add(ur.rol.codigo);
      for (const rp of ur.rol.permisos) permisosSet.add(rp.permiso.codigo);
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      roles: Array.from(rolesSet),
      permisos: Array.from(permisosSet)
    };

    next();
  } catch (error) {
    next(error);
  }
};

// Helpers internos para validación
const isAdmin = (user) => user.roles.includes('ADMIN_SISTEMA');
const hasGlobalPerm = (user, perms) => perms.some(p => user.permisos.includes(p));
const deny = (next, perms) => next(new ForbiddenError(`Se requiere: ${perms.join(', ')}`));

// ==========================================
// 2. AUTORIZACIÓN GLOBAL (Nivel 1: Sistema)
// ==========================================
export const requireSystemPermission = (...requiredPermisos) => {
  return (req, res, next) => {
    if (!req.user) return next(new UnauthorizedError());
    if (isAdmin(req.user) || hasGlobalPerm(req.user, requiredPermisos)) return next();
    return deny(next, requiredPermisos);
  };
};

// ==========================================
// 3. AUTORIZACIÓN CONTEXTUAL (Nivel 2: Proceso)
// ==========================================
export const requireProcesoPermission = (...requiredPermisos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(new UnauthorizedError());
      if (isAdmin(req.user) || hasGlobalPerm(req.user, requiredPermisos)) return next();

      const procesoId = parseInt(req.params.procesoId || req.params.id);
      if (!procesoId) return next(new ForbiddenError('Falta ID del proceso'));

      const vinculacion = await prisma.procesoUsuario.findFirst({
        where: { usuarioId: req.user.id, procesoId, rol: { activo: true } },
        include: { rol: { include: { permisos: { include: { permiso: true } } } } }
      });

      if (!vinculacion) return deny(next, requiredPermisos);

      const hasLocalPerm = vinculacion.rol.permisos.some(rp => requiredPermisos.includes(rp.permiso.codigo));
      if (!hasLocalPerm) return deny(next, requiredPermisos);

      next();
    } catch (error) { next(error); }
  };
};

// ==========================================
// 4. AUTORIZACIÓN CONTEXTUAL (Nivel 3: Actividad)
// ==========================================
export const requireActividadPermission = (...requiredPermisos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(new UnauthorizedError());
      
      // 1. Nivel Sistema: Administrador o permisos globales explícitos
      if (isAdmin(req.user) || hasGlobalPerm(req.user, requiredPermisos)) return next();

      const actividadId = parseInt(req.params.actividadId || req.params.id);
      if (!actividadId) return next(new ForbiddenError('Falta ID de actividad'));

      // Necesitamos el procesoId para validar los permisos de nivel intermedio
      const actividad = await prisma.actividadFase.findUnique({
        where: { id: actividadId },
        select: { procesoId: true }
      });

      if (!actividad) return next(new ForbiddenError('Actividad no encontrada'));

      // 2. Nivel Proceso: ¿Es Gestor de Proceso o Líder de Fase de ESTE proceso?
      const vinculacionProceso = await prisma.procesoUsuario.findFirst({
        where: { usuarioId: req.user.id, procesoId: actividad.procesoId, rol: { activo: true } },
        include: { rol: { include: { permisos: { include: { permiso: true } } } } }
      });

      if (vinculacionProceso) {
        const hasProcesoPerm = vinculacionProceso.rol.permisos.some(rp => requiredPermisos.includes(rp.permiso.codigo));
        if (hasProcesoPerm) return next();
      }

      // 3. Nivel Actividad: Si no es gestor, ¿está asignado directamente a la tarea?
      const vinculacionActividad = await prisma.usuarioActividad.findFirst({
        where: { usuarioId: req.user.id, actividadId, rol: { activo: true } },
        include: { rol: { include: { permisos: { include: { permiso: true } } } } }
      });

      if (!vinculacionActividad) return deny(next, requiredPermisos);

      const hasLocalPerm = vinculacionActividad.rol.permisos.some(rp => requiredPermisos.includes(rp.permiso.codigo));
      if (!hasLocalPerm) return deny(next, requiredPermisos);

      next();
    } catch (error) { next(error); }
  };
};

// ==========================================
// 5. AUTORIZACIÓN CONTEXTUAL (Nivel 4: Evidencia)
// ==========================================
export const requireEvidenciaPermission = (...requiredPermisos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(new UnauthorizedError());
      
      // 1. Nivel Sistema
      if (isAdmin(req.user) || hasGlobalPerm(req.user, requiredPermisos)) return next();

      const evidenciaId = parseInt(req.params.id);
      if (!evidenciaId) return next(new ForbiddenError('Falta ID de evidencia'));

      // Necesitamos escalar para encontrar la Actividad y el Proceso
      const evidencia = await prisma.evidenciaActividad.findUnique({
        where: { id: evidenciaId },
        include: { actividad: { select: { procesoId: true } } }
      });

      if (!evidencia) return next(new ForbiddenError('Evidencia no encontrada'));

      // 2. Nivel Proceso (Validación en Cascada)
      const vinculacionProceso = await prisma.procesoUsuario.findFirst({
        where: { usuarioId: req.user.id, procesoId: evidencia.actividad.procesoId, rol: { activo: true } },
        include: { rol: { include: { permisos: { include: { permiso: true } } } } }
      });

      if (vinculacionProceso) {
        const hasProcesoPerm = vinculacionProceso.rol.permisos.some(rp => requiredPermisos.includes(rp.permiso.codigo));
        if (hasProcesoPerm) return next();
      }

      // 3. Nivel Actividad
      const vinculacionActividad = await prisma.usuarioActividad.findFirst({
        where: { usuarioId: req.user.id, actividadId: evidencia.actividadId, rol: { activo: true } },
        include: { rol: { include: { permisos: { include: { permiso: true } } } } }
      });

      if (!vinculacionActividad) return deny(next, requiredPermisos);

      const hasLocalPerm = vinculacionActividad.rol.permisos.some(rp => requiredPermisos.includes(rp.permiso.codigo));
      if (!hasLocalPerm) return deny(next, requiredPermisos);

      next();
    } catch (error) { next(error); }
  };
};

// ==========================================
// 6. AUTORIZACIÓN CONTEXTUAL (Nivel 5: Fase)
// (Busca el ID de la fase, encuentra a qué proceso pertenece, y valida)
// ==========================================
export const requireFasePermission = (...requiredPermisos) => {
  return async (req, res, next) => {
    try {
      if (!req.user) return next(new UnauthorizedError());
      if (isAdmin(req.user) || hasGlobalPerm(req.user, requiredPermisos)) return next();

      const faseId = parseInt(req.params.id);
      if (!faseId) return next(new ForbiddenError('Falta ID de fase'));

      const fase = await prisma.faseProceso.findUnique({
        where: { id: faseId },
        select: { procesoId: true }
      });

      if (!fase) return next(new ForbiddenError('Fase no encontrada'));

      // Verifica si el usuario tiene permisos en el proceso padre
      const vinculacion = await prisma.procesoUsuario.findFirst({
        where: { usuarioId: req.user.id, procesoId: fase.procesoId, rol: { activo: true } },
        include: { rol: { include: { permisos: { include: { permiso: true } } } } }
      });

      if (!vinculacion) return deny(next, requiredPermisos);

      const hasLocalPerm = vinculacion.rol.permisos.some(rp => requiredPermisos.includes(rp.permiso.codigo));
      if (!hasLocalPerm) return deny(next, requiredPermisos);

      next();
    } catch (error) { next(error); }
  };
};