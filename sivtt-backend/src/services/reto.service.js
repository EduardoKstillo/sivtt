import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class RetoService {
  async getByProceso(procesoId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    if (proceso.tipoActivo !== 'REQUERIMIENTO_EMPRESARIAL') {
      throw new ValidationError('Solo procesos tipo REQUERIMIENTO_EMPRESARIAL tienen reto tecnológico');
    }

    const reto = await prisma.retoTecnologico.findFirst({
      where: { procesoId, deletedAt: null }
    });

    if (!reto) {
      throw new NotFoundError('Reto tecnológico');
    }

    return reto;
  }

  async listConvocatorias(retoId) {
    const reto = await prisma.retoTecnologico.findFirst({
      where: { id: retoId, deletedAt: null }
    });

    if (!reto) {
      throw new NotFoundError('Reto tecnológico');
    }

    const convocatorias = await prisma.convocatoria.findMany({
      where: {
        retoId,
        deletedAt: null
      },
      include: {
        _count: {
          select: {
            postulaciones: {
              where: { deletedAt: null }
            }
          }
        }
      },
      orderBy: [
        { numeroRelanzamiento: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    // Obtener estadísticas de postulaciones para cada convocatoria
    const convocatoriaIds = convocatorias.map(c => c.id);

    const [evaluadasStats, seleccionadasStats] = await Promise.all([
      prisma.postulacionGrupo.groupBy({
        by: ['convocatoriaId'],
        where: {
          convocatoriaId: { in: convocatoriaIds },
          fechaEvaluacion: { not: null },
          deletedAt: null
        },
        _count: true
      }),
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

    // Crear mapas
    const evaluadasMap = new Map(
      evaluadasStats.map(stat => [stat.convocatoriaId, stat._count])
    );

    const seleccionadasMap = new Map(
      seleccionadasStats.map(stat => [stat.convocatoriaId, stat._count])
    );

    // Formatear resultados
    return convocatorias.map(conv => ({
      id: conv.id,
      codigo: conv.codigo,
      titulo: conv.titulo,
      descripcion: conv.descripcion,
      estatus: conv.estatus,
      fechaApertura: conv.fechaApertura,
      fechaCierre: conv.fechaCierre,
      esRelanzamiento: conv.esRelanzamiento,
      numeroRelanzamiento: conv.numeroRelanzamiento,
      motivoRelanzamiento: conv.motivoRelanzamiento,
      convocatoriaOriginalId: conv.convocatoriaOriginalId,
      postulaciones: {
        total: conv._count.postulaciones,
        evaluadas: evaluadasMap.get(conv.id) || 0,
        seleccionadas: seleccionadasMap.get(conv.id) || 0
      },
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt
    }));
  }

  async create(procesoId, data) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    if (proceso.tipoActivo !== 'REQUERIMIENTO_EMPRESARIAL') {
      throw new ValidationError('Solo procesos tipo REQUERIMIENTO_EMPRESARIAL pueden tener reto tecnológico');
    }

    const existing = await prisma.retoTecnologico.findFirst({
      where: { procesoId }
    });

    if (existing) {
      throw new ValidationError('El proceso ya tiene un reto tecnológico');
    }

    return await prisma.retoTecnologico.create({
      data: {
        procesoId,
        ...data
      }
    });
  }

  async update(id, data) {
    const reto = await prisma.retoTecnologico.findFirst({
      where: { id, deletedAt: null }
    });

    if (!reto) {
      throw new NotFoundError('Reto tecnológico');
    }

    return await prisma.retoTecnologico.update({
      where: { id },
      data
    });
  }
}

export default new RetoService();