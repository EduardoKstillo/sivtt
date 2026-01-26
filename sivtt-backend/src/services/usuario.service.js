import prisma from '../config/database.js';
import { NotFoundError, ConflictError, UnauthorizedError } from '../utils/errors.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class UsuarioService {
  async list(filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      deletedAt: null
    };

    // ✅ Filtro por estado activo
    if (filters.activo !== undefined && filters.activo !== '' && filters.activo !== null) {
      // Convertimos a string explícitamente para comparar, o usamos comparación flexible
      const isActivo = String(filters.activo) === 'true';
      where.activo = isActivo;
    }

    // ✅ Filtro por búsqueda (nombre, apellido o email)
    if (filters.search) {
      where.OR = [
        { nombres: { contains: filters.search, mode: 'insensitive' } },
        { apellidos: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    // ✅ FILTRO POR MÚLTIPLES ROLES
    // Ejemplo: roles=ADMIN,DIRECTOR
    if (filters.roles) {
      const rolesArray = filters.roles
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);

      if (rolesArray.length > 0) {
        where.roles = {
          some: {
            rol: {
              codigo: {
                in: rolesArray
              }
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
            include: {
              rol: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true
                }
              }
            }
          },
          _count: {
            select: {
              procesos: true
            }
          }
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

    return buildPaginatedResponse(
      usuariosFormateados,
      total,
      page,
      limit
    );
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
        roles: {
          include: {
            rol: true
          }
        },
        procesos: {
          include: {
            proceso: {
              select: {
                id: true,
                codigo: true,
                titulo: true
              }
            }
          }
        }
      }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    return {
      ...usuario,
      roles: usuario.roles.map(ur => ur.rol),
      procesos: usuario.procesos.map(pu => ({
        procesoId: pu.procesoId,
        proceso: pu.proceso,
        rolProceso: pu.rolProceso
      }))
    };
  }

  async create(data) {
    const existing = await prisma.usuario.findUnique({
      where: { email: data.email }
    });

    if (existing) {
      throw new ConflictError('Ya existe un usuario con este email');
    }

    const hashedPassword = await hashPassword(data.password);

    const usuario = await prisma.usuario.create({
      data: {
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        password: hashedPassword
      },
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        activo: true,
        createdAt: true
      }
    });

    if (data.roles && data.roles.length > 0) {
      await Promise.all(
        data.roles.map(rolId =>
          prisma.usuarioRol.create({
            data: {
              usuarioId: usuario.id,
              rolId
            }
          })
        )
      );
    }

    const usuarioCompleto = await this.getById(usuario.id);
    return usuarioCompleto;
  }

  async update(id, data) {
    const usuario = await prisma.usuario.findFirst({
      where: { id, deletedAt: null }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    if (data.email && data.email !== usuario.email) {
      const existing = await prisma.usuario.findUnique({
        where: { email: data.email }
      });

      if (existing) {
        throw new ConflictError('El email ya está en uso');
      }
    }

    return await prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nombres: true,
        apellidos: true,
        email: true,
        activo: true,
        updatedAt: true
      }
    });
  }

  async changePassword(id, passwordActual, passwordNueva) {
    const usuario = await prisma.usuario.findFirst({
      where: { id, deletedAt: null }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    const isValid = await comparePassword(passwordActual, usuario.password);
    if (!isValid) {
      throw new UnauthorizedError('Contraseña actual incorrecta');
    }

    const hashedPassword = await hashPassword(passwordNueva);

    await prisma.usuario.update({
      where: { id },
      data: { password: hashedPassword }
    });
  }

  async toggleEstado(id, activo) {
    const usuario = await prisma.usuario.findFirst({
      where: { id, deletedAt: null }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    return await prisma.usuario.update({
      where: { id },
      data: { activo },
      select: {
        id: true,
        activo: true,
        updatedAt: true
      }
    });
  }

  async assignRol(usuarioId, rolId) {
    const usuario = await prisma.usuario.findFirst({
      where: { id: usuarioId, deletedAt: null }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario');
    }

    const rol = await prisma.rol.findUnique({
      where: { id: rolId }
    });

    if (!rol) {
      throw new NotFoundError('Rol');
    }

    const existing = await prisma.usuarioRol.findFirst({
      where: { usuarioId, rolId }
    });

    if (existing) {
      throw new ConflictError('El usuario ya tiene este rol');
    }

    return await prisma.usuarioRol.create({
      data: { usuarioId, rolId },
      include: {
        rol: true
      }
    });
  }

  async removeRol(usuarioId, rolId) {
    await prisma.usuarioRol.deleteMany({
      where: { usuarioId, rolId }
    });
  }

  async listRoles() {
    return await prisma.rol.findMany({
      orderBy: { nombre: 'asc' }
    });
  }
}

export default new UsuarioService();