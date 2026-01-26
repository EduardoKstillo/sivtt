import prisma from '../config/database.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class EvidenciaService {
  async listByProceso(procesoId, filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      actividad: { procesoId },
      deletedAt: null
    };

    if (filters.fase) where.fase = filters.fase;
    if (filters.tipo) where.tipoEvidencia = filters.tipo;
    if (filters.estado) where.estado = filters.estado;
    if (filters.actividadId) where.actividadId = parseInt(filters.actividadId);

    const [evidencias, total] = await Promise.all([
      prisma.evidenciaActividad.findMany({
        where,
        skip,
        take,
        include: {
          actividad: {
            select: {
              id: true,
              nombre: true,
              fase: true
            }
          },
          subidoPor: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          },
          revisadoPor: {
            select: {
              id: true,
              nombres: true,
              apellidos: true
            }
          }
        },
        orderBy: [
          { fase: 'asc' },
          { createdAt: 'desc' }
        ]
      }),
      prisma.evidenciaActividad.count({ where })
    ]);

    const agrupacion = await this.getAgrupacionPorFase(procesoId);

    return {
      evidencias,
      agrupacion,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getById(id) {
    const evidencia = await prisma.evidenciaActividad.findFirst({
      where: { id, deletedAt: null },
      include: {
        actividad: {
          select: {
            id: true,
            nombre: true,
            fase: true
          }
        },
        subidoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true
          }
        },
        revisadoPor: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true
          }
        }
      }
    });

    if (!evidencia) {
      throw new NotFoundError('Evidencia');
    }

    return evidencia;
  }

  async create(actividadId, data, userId) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id: actividadId, deletedAt: null },
      include: {
        asignaciones: true
      }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad');
    }

    if (actividad.estado === 'APROBADA') {
      throw new ValidationError('No se pueden subir evidencias a una actividad aprobada');
    }

    const isResponsable = actividad.asignaciones.some(
      a => a.usuarioId === userId && a.rol === 'RESPONSABLE'
    );

    if (!isResponsable) {
      throw new ForbiddenError('Solo el responsable puede subir evidencias');
    }

    const maxVersion = await prisma.evidenciaActividad.findFirst({
      where: { actividadId, deletedAt: null },
      orderBy: { version: 'desc' },
      select: { version: true }
    });

    const version = (maxVersion?.version || 0) + 1;

    // 🔥 TRANSACCIÓN con historial
    const evidencia = await prisma.$transaction(async (tx) => {
      const newEvidencia = await tx.evidenciaActividad.create({
        data: {
          actividadId,
          tipoEvidencia: data.tipoEvidencia,
          nombreArchivo: data.nombreArchivo,
          urlArchivo: data.urlArchivo,
          tamaño: data.tamaño,
          version,
          fase: actividad.fase,
          descripcion: data.descripcion,
          subidoPorId: userId
        }
      });

      // 🔥 Registrar en historial
      await tx.historialActividad.create({
        data: {
          procesoId: actividad.procesoId,
          actividadId,
          accion: 'EVIDENCIA_SUBIDA',
          usuarioId: userId,
          metadata: {
            evidenciaId: newEvidencia.id,
            nombreArchivo: data.nombreArchivo,
            tipoEvidencia: data.tipoEvidencia,
            version
          }
        }
      });

      return newEvidencia;
    });

    // Cambiar estado si hay revisor
    const hasRevisor = actividad.asignaciones.some(a => a.rol === 'REVISOR');
    if (hasRevisor && actividad.estado === 'EN_PROGRESO') {
      await prisma.actividadFase.update({
        where: { id: actividadId },
        data: { estado: 'EN_REVISION' }
      });
    }

    return evidencia;
  }

  async review(id, nuevoEstado, comentarioRevision, userId) {
    const evidencia = await prisma.evidenciaActividad.findFirst({
      where: { id, deletedAt: null },
      include: {
        actividad: {
          include: {
            asignaciones: true
          }
        }
      }
    });

    if (!evidencia) {
      throw new NotFoundError('Evidencia');
    }

    const asignacionUsuario = evidencia.actividad.asignaciones.find(
      a => a.usuarioId === userId
    );

    if (!asignacionUsuario) {
      throw new ForbiddenError('No estás asignado a esta actividad');
    }

    if (asignacionUsuario.rol !== 'REVISOR') {
      throw new ForbiddenError('Solo revisores pueden revisar evidencias');
    }

    // 🔥 TRANSACCIÓN con historial
    const updated = await prisma.$transaction(async (tx) => {
      const updatedEvidencia = await tx.evidenciaActividad.update({
        where: { id },
        data: {
          estado: nuevoEstado,
          comentarioRevision,
          revisadoPorId: userId,
          fechaRevision: new Date()
        }
      });

      // 🔥 Registrar en historial
      const accion = nuevoEstado === 'APROBADA' ? 'EVIDENCIA_APROBADA' : 'EVIDENCIA_RECHAZADA';

      await tx.historialActividad.create({
        data: {
          procesoId: evidencia.actividad.procesoId,
          actividadId: evidencia.actividadId,
          accion,
          usuarioId: userId,
          metadata: {
            evidenciaId: id,
            nombreArchivo: evidencia.nombreArchivo,
            comentarioRevision
          }
        }
      });

      return updatedEvidencia;
    });

    // Actualizar estado de actividad según corresponda
    if (nuevoEstado === 'RECHAZADA') {
      await prisma.actividadFase.update({
        where: { id: evidencia.actividadId },
        data: { estado: 'OBSERVADA' }
      });
    } else if (nuevoEstado === 'APROBADA') {
      await this.checkAllEvidenciasAprobadas(evidencia.actividadId);
    }

    return updated;
  }

  async delete(id) {
    const evidencia = await prisma.evidenciaActividad.findFirst({
      where: { id, deletedAt: null },
      include: {
        actividad: true
      }
    });

    if (!evidencia) {
      throw new NotFoundError('Evidencia');
    }

    if (evidencia.actividad.estado === 'APROBADA') {
      throw new ValidationError('No se puede eliminar evidencia de una actividad aprobada');
    }

    return await prisma.evidenciaActividad.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // async checkAllEvidenciasAprobadas(actividadId) {
  //   const evidencias = await prisma.evidenciaActividad.findMany({
  //     where: { actividadId, deletedAt: null }
  //   });

  //   const allAprobadas = evidencias.length > 0 && evidencias.every(e => e.estado === 'APROBADA');

  //   if (allAprobadas) {
  //     await prisma.actividadFase.update({
  //       where: { id: actividadId },
  //       // data: {
  //       //   estado: 'APROBADA',
  //       //   fechaCierre: new Date()
  //       // }
  //       data: {
  //         estado: 'LISTA_PARA_CIERRE'  // No APROBADA automáticamente
  //       }
  //     });
  //   }
  // }

  async checkAllEvidenciasAprobadas(actividadId) {
    const evidencias = await prisma.evidenciaActividad.findMany({
      where: { actividadId, deletedAt: null }
    });

    const allAprobadas = evidencias.length > 0 &&
      evidencias.every(e => e.estado === 'APROBADA');

    if (allAprobadas) {
      // 🔥 Cambiar a LISTA_PARA_CIERRE, NO a APROBADA
      await prisma.actividadFase.update({
        where: { id: actividadId },
        data: {
          estado: 'LISTA_PARA_CIERRE'
        }
      });
    }
  }

  // async getAgrupacionPorFase(procesoId) {
  //   const fases = [
  //     'CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA',
  //     'FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE'
  //   ];

  //   const agrupacion = {};

  //   for (const fase of fases) {
  //     const [total, aprobadas, pendientes, rechazadas] = await Promise.all([
  //       prisma.evidenciaActividad.count({
  //         where: {
  //           actividad: { procesoId },
  //           fase,
  //           deletedAt: null
  //         }
  //       }),
  //       prisma.evidenciaActividad.count({
  //         where: {
  //           actividad: { procesoId },
  //           fase,
  //           estado: 'APROBADA',
  //           deletedAt: null
  //         }
  //       }),
  //       prisma.evidenciaActividad.count({
  //         where: {
  //           actividad: { procesoId },
  //           fase,
  //           estado: 'PENDIENTE',
  //           deletedAt: null
  //         }
  //       }),
  //       prisma.evidenciaActividad.count({
  //         where: {
  //           actividad: { procesoId },
  //           fase,
  //           estado: 'RECHAZADA',
  //           deletedAt: null
  //         }
  //       })
  //     ]);

  //     if (total > 0) {
  //       agrupacion[fase] = {
  //         total,
  //         aprobadas,
  //         pendientes,
  //         rechazadas
  //       };
  //     }
  //   }

  //   return agrupacion;
  // }

  async getAgrupacionPorFase(procesoId) {
    // UNA SOLA QUERY con groupBy
    const agrupacion = await prisma.evidenciaActividad.groupBy({
      by: ['fase', 'estado'],
      where: {
        actividad: { procesoId },
        deletedAt: null
      },
      _count: true
    });

    // Procesar resultados en un mapa
    const resultado = {};

    agrupacion.forEach(row => {
      // Inicializar fase si no existe
      if (!resultado[row.fase]) {
        resultado[row.fase] = {
          total: 0,
          aprobadas: 0,
          pendientes: 0,
          rechazadas: 0
        };
      }

      // Sumar al total
      resultado[row.fase].total += row._count;

      // Categorizar por estado
      switch (row.estado) {
        case 'APROBADA':
          resultado[row.fase].aprobadas = row._count;
          break;
        case 'PENDIENTE':
          resultado[row.fase].pendientes = row._count;
          break;
        case 'RECHAZADA':
          resultado[row.fase].rechazadas = row._count;
          break;
      }
    });

    return resultado;
  }
}

export default new EvidenciaService();