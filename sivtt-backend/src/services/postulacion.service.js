import prisma from '../config/database.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class PostulacionService {
  async listByConvocatoria(convocatoriaId, filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      convocatoriaId,
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
          grupo: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
              facultad: true,
              coordinador: true
            }
          }
        },
        orderBy: { fechaPostulacion: 'desc' }
      }),
      prisma.postulacionGrupo.count({ where })
    ]);

    const puntajePromedio = await prisma.postulacionGrupo.aggregate({
      where: {
        convocatoriaId,
        puntajeTotal: { not: null },
        deletedAt: null
      },
      _avg: {
        puntajeTotal: true
      }
    });

    const seleccionadas = await prisma.postulacionGrupo.count({
      where: { convocatoriaId, seleccionado: true, deletedAt: null }
    });

    const rechazadas = await prisma.postulacionGrupo.count({
      where: {
        convocatoriaId,
        seleccionado: false,
        fechaEvaluacion: { not: null },
        deletedAt: null
      }
    });

    return {
      postulaciones,
      estadisticas: {
        total,
        seleccionadas,
        rechazadas,
        puntajePromedio: puntajePromedio._avg.puntajeTotal || 0
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getById(id) {
    const postulacion = await prisma.postulacionGrupo.findFirst({
      where: { id, deletedAt: null },
      include: {
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
        },
        grupo: {
          include: {
            miembros: {
              where: { deletedAt: null }
            }
          }
        },
        convocatoria: {
          select: {
            codigo: true,
            titulo: true
          }
        }
      }
    });

    if (!postulacion) {
      throw new NotFoundError('Postulación');
    }

    return postulacion;
  }

  async create(retoId, data) {
    const [reto, grupo, convocatoria] = await Promise.all([
      prisma.retoTecnologico.findFirst({
        where: { id: retoId, deletedAt: null }
      }),
      prisma.grupoInvestigacion.findFirst({
        where: { id: data.grupoId, activo: true, deletedAt: null }
      }),
      prisma.convocatoria.findFirst({
        where: { id: data.convocatoriaId, deletedAt: null }
      })
    ]);

    if (!reto) throw new NotFoundError('Reto tecnológico');
    if (!grupo) throw new NotFoundError('Grupo de investigación');
    if (!convocatoria) throw new NotFoundError('Convocatoria');

    if (convocatoria.estatus !== 'PUBLICADA') {
      throw new ValidationError('La convocatoria no está abierta para postulaciones');
    }

    const now = new Date();
    if (now < convocatoria.fechaApertura || now > convocatoria.fechaCierre) {
      throw new ValidationError('La convocatoria no está dentro del período de postulación');
    }

    const existing = await prisma.postulacionGrupo.findFirst({
      where: {
        convocatoriaId: data.convocatoriaId,
        grupoId: data.grupoId,
        deletedAt: null
      }
    });

    if (existing) {
      throw new ConflictError('El grupo ya postuló a esta convocatoria');
    }

    return await prisma.postulacionGrupo.create({
      data: {
        retoId,
        grupoId: data.grupoId,
        convocatoriaId: data.convocatoriaId,
        notaInteres: data.notaInteres,
        capacidadesTecnicas: data.capacidadesTecnicas,
        propuestaTecnica: data.propuestaTecnica,
        cronogramaPropuesto: data.cronogramaPropuesto,
        presupuestoEstimado: data.presupuestoEstimado,
        equipoDisponible: data.equipoDisponible,
        documentosUrl: data.documentosUrl
      }
    });
  }

  async evaluar(id, data) {
    const postulacion = await prisma.postulacionGrupo.findFirst({
      where: { id, deletedAt: null }
    });

    if (!postulacion) {
      throw new NotFoundError('Postulación');
    }

    return await prisma.postulacionGrupo.update({
      where: { id },
      data: {
        puntajesDetalle: data.puntajesDetalle,
        puntajeTotal: data.puntajeTotal,
        observaciones: data.observaciones,
        fechaEvaluacion: new Date()
      }
    });
  }

  // async seleccionar(id) {
  //   const postulacion = await prisma.postulacionGrupo.findFirst({
  //     where: { id, deletedAt: null }
  //   });

  //   if (!postulacion) {
  //     throw new NotFoundError('Postulación');
  //   }

  //   if (!postulacion.fechaEvaluacion) {
  //     throw new ValidationError('La postulación debe ser evaluada antes de seleccionarla');
  //   }

  //   await prisma.postulacionGrupo.updateMany({
  //     where: {
  //       convocatoriaId: postulacion.convocatoriaId,
  //       NOT: { id }
  //     },
  //     data: { seleccionado: false }
  //   });

  //   return await prisma.postulacionGrupo.update({
  //     where: { id },
  //     data: { seleccionado: true }
  //   });
  // }

  async seleccionar(id) {
    const postulacion = await prisma.postulacionGrupo.findFirst({
      where: { id, deletedAt: null },
      include: {
        convocatoria: {
          select: {
            criteriosSeleccion: true
          }
        }
      }
    });

    if (!postulacion) {
      throw new NotFoundError('Postulación');
    }

    if (!postulacion.fechaEvaluacion) {
      throw new ValidationError('La postulación debe ser evaluada antes de seleccionarla');
    }

    // 🔥 VALIDAR PUNTAJE MÍNIMO
    const puntajeMinimo = postulacion.convocatoria.criteriosSeleccion?.puntajeMinimo || 0;

    if (postulacion.puntajeTotal < puntajeMinimo) {
      throw new ValidationError(
        `Puntaje insuficiente: ${postulacion.puntajeTotal}/${puntajeMinimo} requerido`
      );
    }

    // Deseleccionar otras postulaciones y seleccionar esta
    await prisma.$transaction([
      prisma.postulacionGrupo.updateMany({
        where: {
          convocatoriaId: postulacion.convocatoriaId,
          NOT: { id }
        },
        data: { seleccionado: false }
      }),
      prisma.postulacionGrupo.update({
        where: { id },
        data: { seleccionado: true }
      })
    ]);

    return postulacion;
  }

  async rechazar(id, motivoRechazo) {
    const postulacion = await prisma.postulacionGrupo.findFirst({
      where: { id, deletedAt: null }
    });

    if (!postulacion) {
      throw new NotFoundError('Postulación');
    }

    return await prisma.postulacionGrupo.update({
      where: { id },
      data: {
        seleccionado: false,
        motivoRechazo
      }
    });
  }
}

export default new PostulacionService();