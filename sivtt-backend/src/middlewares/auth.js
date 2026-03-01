import { verifyAccessToken } from '../utils/jwt.js';
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
          where: {
            // Solo roles de ámbito SISTEMA para el req.user base
            rol: { ambito: 'SISTEMA', activo: true }
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
        }
      }
    });

    if (!usuario || !usuario.activo || usuario.deletedAt) {
      throw new UnauthorizedError('Usuario no encontrado o inactivo');
    }

    // Construir set de permisos de sistema para acceso rápido O(1)
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
      // Arrays para compatibilidad con código existente
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
    if (!req.user) {
      return next(new UnauthorizedError());
    }

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
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    // ADMIN_SISTEMA tiene acceso total
    if (req.user.roles.includes('ADMIN_SISTEMA')) {
      return next();
    }

    // Verificar que el usuario tenga AL MENOS UNO de los permisos requeridos
    const hasPermission = requiredPermisos.some(permiso =>
      req.user.permisos.includes(permiso)
    );

    if (!hasPermission) {
      return next(
        new ForbiddenError(
          `Se requiere uno de los siguientes permisos: ${requiredPermisos.join(', ')}`
        )
      );
    }

    next();
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
};