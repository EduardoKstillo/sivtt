import prisma from '../config/database.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class GrupoService {
  
  async list(filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      deletedAt: null
    };

    if (filters.facultad) where.facultad = filters.facultad;
    if (filters.activo !== undefined) where.activo = filters.activo === 'true';
    if (filters.search) {
      where.OR = [
        { codigo: { contains: filters.search, mode: 'insensitive' } },
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { coordinador: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [grupos, total] = await Promise.all([
      prisma.grupoInvestigacion.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          codigo: true,
          nombre: true,
          facultad: true,
          departamentoAcademico: true,
          coordinador: true,
          email: true,
          telefono: true,
          lineasInvestigacion: true,
          activo: true,
          createdAt: true,
          _count: {
            select: {
              postulaciones: {
                where: { deletedAt: null }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.grupoInvestigacion.count({ where })
    ]);

    // ✅ OPTIMIZACIÓN: Una sola query para todas las postulaciones seleccionadas
    const grupoIds = grupos.map(g => g.id);

    const seleccionadasStats = await prisma.postulacionGrupo.groupBy({
      by: ['grupoId'],
      where: {
        grupoId: { in: grupoIds },
        seleccionado: true,
        deletedAt: null
      },
      _count: true
    });

    // Crear mapa para lookup O(1)
    const seleccionadasMap = new Map(
      seleccionadasStats.map(stat => [stat.grupoId, stat._count])
    );

    // Formatear resultados
    const gruposFormateados = grupos.map(grupo => ({
      ...grupo,
      postulacionesActivas: grupo._count.postulaciones,
      postulacionesSeleccionadas: seleccionadasMap.get(grupo.id) || 0
    }));

    return buildPaginatedResponse(gruposFormateados, total, page, limit);
  }

  async listPostulaciones(grupoId, filters) {
    const grupo = await prisma.grupoInvestigacion.findFirst({
      where: { id: grupoId, deletedAt: null }
    });

    if (!grupo) {
      throw new NotFoundError('Grupo de investigación');
    }

    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      grupoId,
      deletedAt: null
    };

    if (filters.seleccionado !== undefined) {
      where.seleccionado = filters.seleccionado === 'true';
    }

    const [postulaciones, total] = await Promise.all([
      prisma.postulacionGrupo.findMany({
        where,
        skip,
        take,
        include: {
          convocatoria: {
            select: {
              id: true,
              codigo: true,
              titulo: true,
              estatus: true,
              fechaApertura: true,
              fechaCierre: true
            }
          },
          reto: {
            select: {
              id: true,
              titulo: true,
              proceso: {
                select: {
                  codigo: true,
                  titulo: true
                }
              }
            }
          }
        },
        orderBy: { fechaPostulacion: 'desc' }
      }),
      prisma.postulacionGrupo.count({ where })
    ]);

    return buildPaginatedResponse(postulaciones, total, page, limit);
  }

  async getById(id) {
    const grupo = await prisma.grupoInvestigacion.findFirst({
      where: { id, deletedAt: null },
      include: {
        miembros: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' }
        },
        postulaciones: {
          where: { deletedAt: null },
          include: {
            convocatoria: {
              select: {
                codigo: true,
                titulo: true
              }
            }
          },
          orderBy: { fechaPostulacion: 'desc' }
        }
      }
    });

    if (!grupo) {
      throw new NotFoundError('Grupo de investigación');
    }

    return grupo;
  }

  async create(data) {
    const existing = await prisma.grupoInvestigacion.findFirst({
      where: { codigo: data.codigo }
    });

    if (existing) {
      throw new ConflictError('Ya existe un grupo con este código');
    }

    return await prisma.grupoInvestigacion.create({
      data
    });
  }

  async update(id, data) {
    const grupo = await prisma.grupoInvestigacion.findFirst({
      where: { id, deletedAt: null }
    });

    if (!grupo) {
      throw new NotFoundError('Grupo de investigación');
    }

    return await prisma.grupoInvestigacion.update({
      where: { id },
      data
    });
  }

  async delete(id) {
    const grupo = await prisma.grupoInvestigacion.findFirst({
      where: { id, deletedAt: null }
    });

    if (!grupo) {
      throw new NotFoundError('Grupo de investigación');
    }

    return await prisma.grupoInvestigacion.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async addMiembro(grupoId, data) {
    const grupo = await prisma.grupoInvestigacion.findFirst({
      where: { id: grupoId, deletedAt: null }
    });

    if (!grupo) {
      throw new NotFoundError('Grupo de investigación');
    }

    return await prisma.miembroGrupo.create({
      data: {
        grupoId,
        ...data
      }
    });
  }

  async removeMiembro(grupoId, miembroId) {
    const miembro = await prisma.miembroGrupo.findFirst({
      where: { id: miembroId, grupoId, deletedAt: null }
    });

    if (!miembro) {
      throw new NotFoundError('Miembro');
    }

    return await prisma.miembroGrupo.update({
      where: { id: miembroId },
      data: { deletedAt: new Date() }
    });
  }
}

export default new GrupoService();