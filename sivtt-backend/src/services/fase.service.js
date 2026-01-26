import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class FaseService {
  async listByProceso(procesoId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    const fases = await prisma.faseProceso.findMany({
      where: { procesoId, deletedAt: null },
      include: {
        responsable: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true
          }
        },
        actividades: {
          where: { deletedAt: null },
          select: {
            id: true,
            nombre: true,
            estado: true,
            tipo: true,
            fechaCierre: true
          }
        },
        decisiones: {
          include: {
            decididor: {
              select: {
                id: true,
                nombres: true,
                apellidos: true
              }
            }
          },
          orderBy: { fecha: 'desc' }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });

    const fasesWithStats = await Promise.all(fases.map(async (fase) => {
      const actividadesTotales = await prisma.actividadFase.count({
        where: { faseProcesoId: fase.id, deletedAt: null }
      });

      const actividadesCompletadas = await prisma.actividadFase.count({
        where: { faseProcesoId: fase.id, estado: 'APROBADA', deletedAt: null }
      });

      const evidenciasAprobadas = await prisma.evidenciaActividad.count({
        where: {
          actividad: { faseProcesoId: fase.id },
          estado: 'APROBADA',
          deletedAt: null
        }
      });

      let empresasVinculadas = [];
      if (proceso.tipoActivo === 'PATENTE' && fase.fase === 'MATCH') {
        empresasVinculadas = await prisma.procesoEmpresa.findMany({
          where: { procesoId, deletedAt: null },
          include: {
            empresa: {
              select: {
                id: true,
                razonSocial: true,
                ruc: true
              }
            }
          }
        });
      }

      return {
        ...fase,
        estadisticas: {
          actividadesTotales,
          actividadesCompletadas,
          evidenciasAprobadas
        },
        ...(empresasVinculadas.length > 0 && {
          empresasVinculadas: empresasVinculadas.map(pe => ({
            ...pe.empresa,
            ndaFirmado: pe.ndaFirmado,
            estado: pe.estado
          }))
        })
      };
    }));

    return fasesWithStats;
  }

  async getByFase(procesoId, fase) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    const faseProceso = await prisma.faseProceso.findFirst({
      where: { procesoId, fase, deletedAt: null },
      include: {
        responsable: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true
          }
        },
        // ✅ AGREGADO: Incluir decisiones para mostrar en el detalle
        decisiones: {
          include: {
            decididor: {
              select: { id: true, nombres: true, apellidos: true }
            }
          },
          orderBy: { fecha: 'desc' }
        },
        actividades: {
          where: { deletedAt: null },
          include: {
            asignaciones: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    nombres: true,
                    apellidos: true
                  }
                }
              }
            },
            evidencias: {
              where: { deletedAt: null }
            }
          }
        }
      }
    });

    if (!faseProceso) {
      throw new NotFoundError('Fase');
    }

    const actividades = faseProceso.actividades.map(act => ({
      id: act.id,
      nombre: act.nombre,
      descripcion: act.descripcion,
      tipo: act.tipo,
      estado: act.estado,
      obligatoria: act.obligatoria,
      fechaInicio: act.fechaInicio,
      fechaLimite: act.fechaLimite,
      responsables: act.asignaciones
        .filter(a => a.rol === 'RESPONSABLE')
        .map(a => a.usuario),
      evidencias: {
        total: act.evidencias.length,
        aprobadas: act.evidencias.filter(e => e.estado === 'APROBADA').length,
        pendientes: act.evidencias.filter(e => e.estado === 'PENDIENTE').length
      }
    }));

    let empresasVinculadas = [];
    if (proceso.tipoActivo === 'PATENTE' && fase === 'MATCH') {
      empresasVinculadas = await prisma.procesoEmpresa.findMany({
        where: { procesoId, deletedAt: null },
        include: {
          empresa: true
        }
      });
    }

    return {
      ...faseProceso,
      actividades,
      ...(empresasVinculadas.length > 0 && { empresasVinculadas })
    };
  }

  async update(id, data) {
    const fase = await prisma.faseProceso.findFirst({
      where: { id, deletedAt: null }
    });

    if (!fase) {
      throw new NotFoundError('Fase');
    }

    return await prisma.faseProceso.update({
      where: { id },
      data
    });
  }

  async close(id, observaciones, userId) {
    const fase = await prisma.faseProceso.findFirst({
      where: { id, deletedAt: null },
      include: {
        actividades: {
          where: { obligatoria: true, deletedAt: null }
        }
      }
    });

    if (!fase) {
      throw new NotFoundError('Fase');
    }

    const actividadesPendientes = fase.actividades.filter(a => a.estado !== 'APROBADA');
    if (actividadesPendientes.length > 0) {
      throw new ValidationError('No se puede cerrar la fase. Existen actividades obligatorias pendientes');
    }

    return await prisma.faseProceso.update({
      where: { id },
      data: {
        estado: 'CERRADA',
        fechaFin: new Date(),
        observaciones
      }
    });
  }
}

export default new FaseService();