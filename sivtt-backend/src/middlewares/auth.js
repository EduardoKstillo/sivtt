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

// ==========================================
// 7. GUARDIÁN DE ESTADO DEL PROCESO (Mute Lock)
// Previene cualquier escritura si el proceso está Pausado, Cancelado o Finalizado.
// ==========================================
export const requireActiveProceso = async (req, res, next) => {
  try {
    let procesoId = parseInt(req.params.procesoId || req.params.id);

    // Si la ruta no trae el procesoId directo, pero trae actividadId o evidenciaId, lo escalamos
    if (!procesoId && req.params.actividadId) {
      const act = await prisma.actividadFase.findUnique({
        where: { id: parseInt(req.params.actividadId) }, select: { procesoId: true }
      });
      if (act) procesoId = act.procesoId;
    } else if (!procesoId && req.baseUrl.includes('evidencias') && req.params.id) {
      const evi = await prisma.evidenciaActividad.findUnique({
        where: { id: parseInt(req.params.id) }, include: { actividad: { select: { procesoId: true } } }
      });
      if (evi) procesoId = evi.actividad.procesoId;
    } else if (!procesoId && req.baseUrl.includes('fases') && req.params.id) {
      const fase = await prisma.faseProceso.findUnique({
        where: { id: parseInt(req.params.id) }, select: { procesoId: true }
      });
      if (fase) procesoId = fase.procesoId;
    }

    if (!procesoId) return next(); // Si es una ruta global, pasamos de largo

    const proceso = await prisma.procesoVinculacion.findUnique({
      where: { id: procesoId }, select: { estado: true, deletedAt: true }
    });

    if (!proceso || proceso.deletedAt) {
      return next(new NotFoundError('El proceso al que intenta acceder no existe o fue eliminado.'));
    }

    // 🔥 EL CANDADO:
    if (proceso.estado !== 'ACTIVO') {
      return next(new ForbiddenError(`Operación bloqueada. El proceso se encuentra ${proceso.estado}.`));
    }

    next();
  } catch (error) {
    next(error);
  }
};