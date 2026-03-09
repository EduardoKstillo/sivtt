import prisma from '../config/database.js';
import { NotFoundError, ConflictError, UnauthorizedError, ValidationError } from '../utils/errors.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class UsuarioService {
  async list(filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = { deletedAt: null };

    if (filters.activo !== undefined && filters.activo !== '' && filters.activo !== null) {
      where.activo = String(filters.activo) === 'true';
    }

    if (filters.search) {
      where.OR = [
        { nombres: { contains: filters.search, mode: 'insensitive' } },
        { apellidos: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // Filtro por múltiples roles (solo ámbito SISTEMA)
    if (filters.roles) {
      const rolesArray = filters.roles
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      if (rolesArray.length > 0) {
        where.roles = {
          some: {
            rol: {
              codigo: { in: rolesArray },
              ambito: 'SISTEMA'
            }
          }
        };
      }
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          nombres: true,
          apellidos: true,
          email: true,
          activo: true,
          createdAt: true,
          roles: {
            where: { rol: { activo: true } },
            include: {
              rol: {
                select: { id: true, codigo: true, nombre: true, ambito: true }
              }
            }
          },
          _count: { select: { procesos: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.usuario.count({ where })
    ]);

    const usuariosFormateados = usuarios.map(usuario => ({
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      activo: usuario.activo,
      createdAt: usuario.createdAt,
      roles: usuario.roles.map(ur => ur.rol),
      procesosActivos: usuario._count.procesos
    }));

    return buildPaginatedResponse(usuariosFormateados, total, page, limit);
  }
  
  async getCatalogo() {
    // Retorna solo datos no sensibles de usuarios activos para llenar dropdowns
    return await prisma.usuario.findMany({
      where: { activo: true, deletedAt: null },
      select: { id: true, nombres: true, apellidos: true, email: true },
      orderBy: { nombres: 'asc' }
    });
  }

  async getById(id) {
    const usuario = await prisma.usuario.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
        // Roles de sistema
        roles: {
          where: { rol: { activo: true } },
          include: {
            rol: {
              include: {
                permisos: {
                  include: { permiso: true }
                }
              }
            }
          }
        },
        // Procesos donde participa con su rol en el proceso
        procesos: {
          include: {
            proceso: {
              select: { id: true, codigo: true, titulo: true, estado: true }
            },
            rol: {
              select: { id: true, codigo: true, nombre: true }
            }
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    // Consolidar permisos únicos de todos los roles de sistema
    const permisosSet = new Set();
    for (const ur of usuario.roles) {
      for (const rp of ur.rol.permisos) {
        permisosSet.add(rp.permiso.codigo);
      }
    }

    return {
      id: usuario.id,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      email: usuario.email,
      activo: usuario.activo,
      createdAt: usuario.createdAt,
      updatedAt: usuario.updatedAt,
      // Roles de sistema con sus permisos
      roles: usuario.roles.map(ur => ({
        ...ur.rol,
        permisos: ur.rol.permisos.map(rp => rp.permiso)
      })),
      // Resumen de permisos para uso directo
      permisos: Array.from(permisosSet),
      // Procesos donde participa
      procesos: usuario.procesos.map(pu => ({
        procesoId: pu.procesoId,
        proceso: pu.proceso,
        rol: pu.rol // Rol DENTRO del proceso (ámbito PROCESO)
      }))
    };
  }

  async create(data) {
    const existing = await prisma.usuario.findUnique({ where: { email: data.email } });

    if (existing) {
      throw new ConflictError('Ya existe un usuario con este email');
    }

    // Validar que los roles existen y son de ámbito SISTEMA
    if (data.roles && data.roles.length > 0) {
      const roles = await prisma.rol.findMany({
        where: { id: { in: data.roles }, activo: true }
      });

      if (roles.length !== data.roles.length) {
        throw new ValidationError('Uno o más roles no existen o están inactivos');
      }

      const rolesNoSistema = roles.filter(r => r.ambito !== 'SISTEMA');
      if (rolesNoSistema.length > 0) {
        throw new ValidationError(
          'Solo se pueden asignar roles de ámbito SISTEMA al crear un usuario. ' +
          `Los siguientes no son de sistema: ${rolesNoSistema.map(r => r.codigo).join(', ')}`
        );
      }
    }

    const hashedPassword = await hashPassword(data.password);

    const usuario = await prisma.usuario.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        password: hashedPassword
      },
      select: { id: true, nombres: true, apellidos: true, email: true, activo: true, createdAt: true }
    });

    if (data.roles && data.roles.length > 0) {
      await prisma.usuarioRol.createMany({
        data: data.roles.map(rolId => ({ usuarioId: usuario.id, rolId }))
      });
    }

    return await this.getById(usuario.id);
  }

  async update(id, data) {
    const usuario = await prisma.usuario.findFirst({ where: { id, deletedAt: null } });

    if (!usuario) throw new NotFoundError('Usuario');

    if (data.email && data.email !== usuario.email) {
      const existing = await prisma.usuario.findUnique({ where: { email: data.email } });
      if (existing) throw new ConflictError('El email ya está en uso');
    }

    return await prisma.usuario.update({
      where: { id },
      data,
      select: { id: true, nombres: true, apellidos: true, email: true, activo: true, updatedAt: true }
    });
  }

  async changePassword(id, passwordActual, passwordNueva) {
    const usuario = await prisma.usuario.findFirst({ where: { id, deletedAt: null } });

    if (!usuario) throw new NotFoundError('Usuario');

    const isValid = await comparePassword(passwordActual, usuario.password);
    if (!isValid) throw new UnauthorizedError('Contraseña actual incorrecta');

    const hashedPassword = await hashPassword(passwordNueva);
    await prisma.usuario.update({ where: { id }, data: { password: hashedPassword } });
  }

  async toggleEstado(id, activo) {
    const usuario = await prisma.usuario.findFirst({ where: { id, deletedAt: null } });

    if (!usuario) throw new NotFoundError('Usuario');

    return await prisma.usuario.update({
      where: { id },
      data: { activo },
      select: { id: true, activo: true, updatedAt: true }
    });
  }

  async assignRol(usuarioId, rolId) {
    const usuario = await prisma.usuario.findFirst({ where: { id: usuarioId, deletedAt: null } });
    if (!usuario) throw new NotFoundError('Usuario');

    const rol = await prisma.rol.findUnique({ where: { id: rolId, activo: true } });
    if (!rol) throw new NotFoundError('Rol');

    // Solo roles de ámbito SISTEMA se asignan directamente al usuario
    if (rol.ambito !== 'SISTEMA') {
      throw new ValidationError(
        `El rol "${rol.codigo}" es de ámbito ${rol.ambito}. ` +
        'Los roles de ámbito PROCESO deben asignarse a través del proceso, ' +
        'y los de ACTIVIDAD a través de la actividad.'
      );
    }

    const existing = await prisma.usuarioRol.findFirst({ where: { usuarioId, rolId } });
    if (existing) throw new ConflictError('El usuario ya tiene este rol');

    return await prisma.usuarioRol.create({
      data: { usuarioId, rolId },
      include: { rol: { include: { permisos: { include: { permiso: true } } } } }
    });
  }

  async removeRol(usuarioId, rolId) {
    const usuario = await prisma.usuario.findFirst({ where: { id: usuarioId, deletedAt: null } });
    if (!usuario) throw new NotFoundError('Usuario');

    await prisma.usuarioRol.deleteMany({ where: { usuarioId, rolId } });
  }

  // ==========================================
  // LISTADO DE ROLES — ahora filtrable por ámbito
  // ==========================================

  async listRoles(filters = {}) {
    const where = { activo: true };

    if (filters.ambito) {
      where.ambito = filters.ambito;
    }

    return await prisma.rol.findMany({
      where,
      include: {
        permisos: {
          include: { permiso: { select: { id: true, codigo: true, modulo: true } } }
        },
        _count: {
          select: { usuariosSistema: true }
        }
      },
      orderBy: [{ ambito: 'asc' }, { nombre: 'asc' }]
    });
  }
}

export default new UsuarioService();