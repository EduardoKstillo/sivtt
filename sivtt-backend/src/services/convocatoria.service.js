import prisma from '../config/database.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class ConvocatoriaService {
  // async list(filters) {
  //   const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

  //   const where = {
  //     deletedAt: null
  //   };

  //   if (filters.estatus) where.estatus = filters.estatus;
  //   if (filters.retoId) where.retoId = parseInt(filters.retoId);

  //   const [convocatorias, total] = await Promise.all([
  //     prisma.convocatoria.findMany({
  //       where,
  //       skip,
  //       take,
  //       include: {
  //         reto: {
  //           select: {
  //             id: true,
  //             titulo: true,
  //             proceso: {
  //               select: {
  //                 codigo: true,
  //                 titulo: true
  //               }
  //             }
  //           }
  //         },
  //         _count: {
  //           select: {
  //             postulaciones: true
  //           }
  //         }
  //       },
  //       orderBy: { createdAt: 'desc' }
  //     }),
  //     prisma.convocatoria.count({ where })
  //   ]);

  //   const convocatoriasFormateadas = await Promise.all(convocatorias.map(async (conv) => {
  //     const [evaluadas, seleccionadas] = await Promise.all([
  //       prisma.postulacionGrupo.count({
  //         where: { 
  //           convocatoriaId: conv.id,
  //           fechaEvaluacion: { not: null },
  //           deletedAt: null
  //         }
  //       }),
  //       prisma.postulacionGrupo.count({
  //         where: { 
  //           convocatoriaId: conv.id,
  //           seleccionado: true,
  //           deletedAt: null
  //         }
  //       })
  //     ]);

  //     return {
  //       ...conv,
  //       postulaciones: {
  //         total: conv._count.postulaciones,
  //         evaluadas,
  //         seleccionadas
  //       }
  //     };
  //   }));

  //   return buildPaginatedResponse(convocatoriasFormateadas, total, page, limit);
  // }

  async list(filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      deletedAt: null
    };

    if (filters.estatus) where.estatus = filters.estatus;
    if (filters.retoId) where.retoId = parseInt(filters.retoId);

    const [convocatorias, total] = await Promise.all([
      prisma.convocatoria.findMany({
        where,
        skip,
        take,
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
      prisma.convocatoria.count({ where })
    ]);

    // ✅ OPTIMIZACIÓN: Una sola query para todas las estadísticas
    const convocatoriaIds = convocatorias.map(c => c.id);

    const [evaluadasStats, seleccionadasStats] = await Promise.all([
      // Contar evaluadas por convocatoria
      prisma.postulacionGrupo.groupBy({
        by: ['convocatoriaId'],
        where: {
          convocatoriaId: { in: convocatoriaIds },
          fechaEvaluacion: { not: null },
          deletedAt: null
        },
        _count: true
      }),
      // Contar seleccionadas por convocatoria
      prisma.postulacionGrupo.groupBy({
        by: ['convocatoriaId'],
        where: {
          convocatoriaId: { in: convocatoriaIds },
          seleccionado: true,
          deletedAt: null
        },
        _count: true
      })
    ]);

    // Crear mapas para lookup O(1)
    const evaluadasMap = new Map(
      evaluadasStats.map(stat => [stat.convocatoriaId, stat._count])
    );

    const seleccionadasMap = new Map(
      seleccionadasStats.map(stat => [stat.convocatoriaId, stat._count])
    );

    // Formatear resultados
    const convocatoriasFormateadas = convocatorias.map(conv => ({
      ...conv,
      postulaciones: {
        total: conv._count.postulaciones,
        evaluadas: evaluadasMap.get(conv.id) || 0,
        seleccionadas: seleccionadasMap.get(conv.id) || 0
      }
    }));

    return buildPaginatedResponse(convocatoriasFormateadas, total, page, limit);
  }

  // async getById(id) {
  //   const convocatoria = await prisma.convocatoria.findFirst({
  //     where: { id, deletedAt: null },
  //     include: {
  //       reto: {
  //         select: {
  //           id: true,
  //           titulo: true,
  //           descripcion: true,
  //           prioridad: true
  //         }
  //       },
  //       _count: {
  //         select: {
  //           postulaciones: true
  //         }
  //       }
  //     }
  //   });

  //   if (!convocatoria) {
  //     throw new NotFoundError('Convocatoria');
  //   }

  //   const [evaluadas, seleccionadas, rechazadas] = await Promise.all([
  //     prisma.postulacionGrupo.count({
  //       where: {
  //         convocatoriaId: id,
  //         fechaEvaluacion: { not: null },
  //         deletedAt: null
  //       }
  //     }),
  //     prisma.postulacionGrupo.count({
  //       where: {
  //         convocatoriaId: id,
  //         seleccionado: true,
  //         deletedAt: null
  //       }
  //     }),
  //     prisma.postulacionGrupo.count({
  //       where: {
  //         convocatoriaId: id,
  //         seleccionado: false,
  //         fechaEvaluacion: { not: null },
  //         deletedAt: null
  //       }
  //     })
  //   ]);

  //   return {
  //     ...convocatoria,
  //     postulaciones: {
  //       total: convocatoria._count.postulaciones,
  //       evaluadas,
  //       seleccionadas,
  //       rechazadas
  //     }
  //   };
  // }

  async getById(id) {
    const convocatoria = await prisma.convocatoria.findFirst({
      where: { id, deletedAt: null },
      include: {
        reto: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            prioridad: true
          }
        }
      }
    });

    if (!convocatoria) {
      throw new NotFoundError('Convocatoria');
    }

    // ✅ OPTIMIZACIÓN: Una sola query con groupBy
    const statsAgrupadas = await prisma.postulacionGrupo.groupBy({
      by: ['seleccionado'],
      where: {
        convocatoriaId: id,
        fechaEvaluacion: { not: null },
        deletedAt: null
      },
      _count: true
    });

    // Contar total de postulaciones
    const totalPostulaciones = await prisma.postulacionGrupo.count({
      where: {
        convocatoriaId: id,
        deletedAt: null
      }
    });

    // Procesar estadísticas
    let seleccionadas = 0;
    let rechazadas = 0;

    statsAgrupadas.forEach(stat => {
      if (stat.seleccionado) {
        seleccionadas = stat._count;
      } else {
        rechazadas = stat._count;
      }
    });

    const evaluadas = seleccionadas + rechazadas;

    return {
      ...convocatoria,
      postulaciones: {
        total: totalPostulaciones,
        evaluadas,
        seleccionadas,
        rechazadas
      }
    };
  }

  async create(retoId, data) {
    const reto = await prisma.retoTecnologico.findFirst({
      where: { id: retoId, deletedAt: null }
    });

    if (!reto) {
      throw new NotFoundError('Reto tecnológico');
    }

    const codigo = await this.generateCodigo();

    return await prisma.convocatoria.create({
      data: {
        retoId,
        codigo,
        ...data
      }
    });
  }

  async update(id, data) {
    const convocatoria = await prisma.convocatoria.findFirst({
      where: { id, deletedAt: null }
    });

    if (!convocatoria) {
      throw new NotFoundError('Convocatoria');
    }

    if (convocatoria.estatus !== 'BORRADOR') {
      throw new ValidationError('Solo se pueden editar convocatorias en estado BORRADOR');
    }

    return await prisma.convocatoria.update({
      where: { id },
      data
    });
  }

  async publicar(id) {
    const convocatoria = await prisma.convocatoria.findFirst({
      where: { id, deletedAt: null }
    });

    if (!convocatoria) {
      throw new NotFoundError('Convocatoria');
    }

    if (convocatoria.estatus !== 'BORRADOR') {
      throw new ValidationError('Solo se pueden publicar convocatorias en estado BORRADOR');
    }

    return await prisma.convocatoria.update({
      where: { id },
      data: { estatus: 'PUBLICADA' }
    });
  }

  async cerrar(id) {
    const convocatoria = await prisma.convocatoria.findFirst({
      where: { id, deletedAt: null }
    });

    if (!convocatoria) {
      throw new NotFoundError('Convocatoria');
    }

    if (convocatoria.estatus !== 'PUBLICADA') {
      throw new ValidationError('Solo se pueden cerrar convocatorias PUBLICADAS');
    }

    return await prisma.convocatoria.update({
      where: { id },
      data: { estatus: 'CERRADA' }
    });
  }

  async relanzar(id, data) {
    const convocatoriaOriginal = await prisma.convocatoria.findFirst({
      where: { id, deletedAt: null }
    });

    if (!convocatoriaOriginal) {
      throw new NotFoundError('Convocatoria');
    }

    if (convocatoriaOriginal.estatus !== 'CERRADA') {
      throw new ValidationError('Solo se pueden relanzar convocatorias CERRADAS');
    }

    const hasSeleccionado = await prisma.postulacionGrupo.findFirst({
      where: {
        convocatoriaId: id,
        seleccionado: true,
        deletedAt: null
      }
    });

    if (hasSeleccionado) {
      throw new ValidationError('No se puede relanzar si ya hay una postulación seleccionada');
    }

    const numeroRelanzamiento = convocatoriaOriginal.numeroRelanzamiento + 1;
    const codigo = `${convocatoriaOriginal.codigo.split('-R')[0]}-R${numeroRelanzamiento}`;

    const nuevaConvocatoria = await prisma.convocatoria.create({
      data: {
        retoId: convocatoriaOriginal.retoId,
        codigo,
        titulo: convocatoriaOriginal.titulo,
        descripcion: convocatoriaOriginal.descripcion,
        estatus: 'BORRADOR',
        fechaApertura: data.fechaApertura,
        fechaCierre: data.fechaCierre,
        criteriosSeleccion: data.modificaciones?.criteriosSeleccion || convocatoriaOriginal.criteriosSeleccion,
        requisitosPostulacion: data.modificaciones?.requisitosPostulacion || convocatoriaOriginal.requisitosPostulacion,
        esRelanzamiento: true,
        convocatoriaOriginalId: id,
        numeroRelanzamiento,
        motivoRelanzamiento: data.motivoRelanzamiento
      }
    });

    return nuevaConvocatoria;
  }

  async generateCodigo() {
    const year = new Date().getFullYear();
    const count = await prisma.convocatoria.count({
      where: {
        codigo: {
          startsWith: `CONV-${year}-`
        }
      }
    });

    return `CONV-${year}-${String(count + 1).padStart(3, '0')}`;
  }
}

export default new ConvocatoriaService();