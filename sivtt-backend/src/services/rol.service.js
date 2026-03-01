import prisma from '../config/database.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class RolService {
  // ==========================================
  // GESTIÓN DE ROLES
  // ==========================================

  async listRoles(filters = {}) {
    const where = { activo: true };

    if (filters.ambito) {
      where.ambito = filters.ambito;
    }

    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { codigo: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.includeInactive === 'true') {
      delete where.activo;
    }

    return await prisma.rol.findMany({
      where,
      include: {
        permisos: {
          include: {
            permiso: true
          }
        },
        _count: {
          select: {
            usuariosSistema: true,
            usuariosProceso: true,
            usuariosActividad: true
          }
        }
      },
      orderBy: [{ ambito: 'asc' }, { nombre: 'asc' }]
    });
  }

  async getRolById(id) {
    const rol = await prisma.rol.findUnique({
      where: { id },
      include: {
        permisos: {
          include: {
            permiso: true
          }
        },
        _count: {
          select: {
            usuariosSistema: true,
            usuariosProceso: true,
            usuariosActividad: true
          }
        }
      }
    });

    if (!rol) {
      throw new NotFoundError('Rol');
    }

    return {
      ...rol,
      permisos: rol.permisos.map(rp => rp.permiso)
    };
  }

  async createRol(data) {
    const existing = await prisma.rol.findFirst({
      where: {
        OR: [{ codigo: data.codigo }, { nombre: data.nombre }]
      }
    });

    if (existing) {
      throw new ConflictError(
        existing.codigo === data.codigo
          ? 'Ya existe un rol con este código'
          : 'Ya existe un rol con este nombre'
      );
    }

    const rol = await prisma.rol.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
        ambito: data.ambito,
        descripcion: data.descripcion || null
      }
    });

    // Asignar permisos iniciales si se proporcionan
    if (data.permisos && data.permisos.length > 0) {
      await this._assignPermisosToRol(rol.id, data.permisos);
    }

    return await this.getRolById(rol.id);
  }

  async updateRol(id, data) {
    const rol = await prisma.rol.findUnique({ where: { id } });

    if (!rol) {
      throw new NotFoundError('Rol');
    }

    if (data.codigo && data.codigo !== rol.codigo) {
      const existing = await prisma.rol.findUnique({ where: { codigo: data.codigo } });
      if (existing) throw new ConflictError('Ya existe un rol con este código');
    }

    if (data.nombre && data.nombre !== rol.nombre) {
      const existing = await prisma.rol.findFirst({ where: { nombre: data.nombre } });
      if (existing) throw new ConflictError('Ya existe un rol con este nombre');
    }

    const { permisos, ...rolData } = data;

    await prisma.rol.update({
      where: { id },
      data: rolData
    });

    // Si se envían permisos, reemplazar los existentes
    if (permisos !== undefined) {
      await prisma.rolPermiso.deleteMany({ where: { rolId: id } });
      if (permisos.length > 0) {
        await this._assignPermisosToRol(id, permisos);
      }
    }

    return await this.getRolById(id);
  }

  async toggleEstadoRol(id, activo) {
    const rol = await prisma.rol.findUnique({ where: { id } });

    if (!rol) {
      throw new NotFoundError('Rol');
    }

    return await prisma.rol.update({
      where: { id },
      data: { activo },
      select: { id: true, codigo: true, nombre: true, activo: true }
    });
  }

  // ==========================================
  // GESTIÓN DE PERMISOS
  // ==========================================

  async listPermisos(filters = {}) {
    const where = {};

    if (filters.modulo) {
      where.modulo = filters.modulo;
    }

    if (filters.search) {
      where.OR = [
        { codigo: { contains: filters.search, mode: 'insensitive' } },
        { descripcion: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const permisos = await prisma.permiso.findMany({
      where,
      orderBy: [{ modulo: 'asc' }, { codigo: 'asc' }]
    });

    // Agrupar por módulo para facilitar el uso en el frontend
    const agrupados = permisos.reduce((acc, permiso) => {
      if (!acc[permiso.modulo]) {
        acc[permiso.modulo] = [];
      }
      acc[permiso.modulo].push(permiso);
      return acc;
    }, {});

    return { permisos, agrupados };
  }

  async createPermiso(data) {
    const existing = await prisma.permiso.findUnique({ where: { codigo: data.codigo } });

    if (existing) {
      throw new ConflictError('Ya existe un permiso con este código');
    }

    return await prisma.permiso.create({
      data: {
        codigo: data.codigo,
        modulo: data.modulo,
        descripcion: data.descripcion || null
      }
    });
  }

  async updatePermiso(id, data) {
    const permiso = await prisma.permiso.findUnique({ where: { id } });

    if (!permiso) {
      throw new NotFoundError('Permiso');
    }

    if (data.codigo && data.codigo !== permiso.codigo) {
      const existing = await prisma.permiso.findUnique({ where: { codigo: data.codigo } });
      if (existing) throw new ConflictError('Ya existe un permiso con este código');
    }

    return await prisma.permiso.update({
      where: { id },
      data
    });
  }

  async deletePermiso(id) {
    const permiso = await prisma.permiso.findUnique({ where: { id } });

    if (!permiso) {
      throw new NotFoundError('Permiso');
    }

    await prisma.permiso.delete({ where: { id } });
  }

  // ==========================================
  // ASIGNACIÓN DE PERMISOS A ROLES
  // ==========================================

  async assignPermisosToRol(rolId, permisoIds) {
    const rol = await prisma.rol.findUnique({ where: { id: rolId } });

    if (!rol) {
      throw new NotFoundError('Rol');
    }

    // Verificar que todos los permisos existen
    const permisos = await prisma.permiso.findMany({
      where: { id: { in: permisoIds } }
    });

    if (permisos.length !== permisoIds.length) {
      throw new ValidationError('Uno o más permisos no existen');
    }

    await this._assignPermisosToRol(rolId, permisoIds);

    return await this.getRolById(rolId);
  }

  async removePermisoFromRol(rolId, permisoId) {
    const existing = await prisma.rolPermiso.findFirst({
      where: { rolId, permisoId }
    });

    if (!existing) {
      throw new NotFoundError('Asignación de permiso');
    }

    await prisma.rolPermiso.deleteMany({ where: { rolId, permisoId } });
  }

  async syncPermisosRol(rolId, permisoIds) {
    const rol = await prisma.rol.findUnique({ where: { id: rolId } });

    if (!rol) {
      throw new NotFoundError('Rol');
    }

    // Reemplaza todos los permisos del rol
    await prisma.rolPermiso.deleteMany({ where: { rolId } });

    if (permisoIds.length > 0) {
      await this._assignPermisosToRol(rolId, permisoIds);
    }

    return await this.getRolById(rolId);
  }

  // ==========================================
  // UTILIDADES INTERNAS
  // ==========================================

  async _assignPermisosToRol(rolId, permisoIds) {
    // Obtener permisos ya asignados para evitar duplicados
    const existing = await prisma.rolPermiso.findMany({
      where: { rolId, permisoId: { in: permisoIds } },
      select: { permisoId: true }
    });

    const existingIds = new Set(existing.map(e => e.permisoId));
    const newPermisoIds = permisoIds.filter(id => !existingIds.has(id));

    if (newPermisoIds.length > 0) {
      await prisma.rolPermiso.createMany({
        data: newPermisoIds.map(permisoId => ({ rolId, permisoId }))
      });
    }
  }

  // Obtener todos los permisos de un usuario (para caché en token/sesión)
  async getPermisosUsuario(usuarioId) {
    const usuarioRoles = await prisma.usuarioRol.findMany({
      where: { usuarioId },
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

    const permisos = new Set();
    for (const ur of usuarioRoles) {
      for (const rp of ur.rol.permisos) {
        permisos.add(rp.permiso.codigo);
      }
    }

    return Array.from(permisos);
  }
}

export default new RolService();