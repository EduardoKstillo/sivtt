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
          select: { id: true, nombres: true, apellidos: true, email: true }
        },
        actividades: {
          where: { deletedAt: null },
          select: { id: true, nombre: true, estado: true, tipo: true, fechaCierre: true }
        },
        decisiones: {
          include: {
            decididor: { select: { id: true, nombres: true, apellidos: true } }
          },
          orderBy: { fecha: 'desc' }
        }
      },
      orderBy: { fechaInicio: 'asc' }
    });

    const fasesWithStats = await Promise.all(fases.map(async (fase) => {
      const [actividadesTotales, actividadesCompletadas, evidenciasAprobadas] = await Promise.all([
        prisma.actividadFase.count({
          where: { faseProcesoId: fase.id, deletedAt: null }
        }),
        prisma.actividadFase.count({
          where: { faseProcesoId: fase.id, estado: 'APROBADA', deletedAt: null }
        }),
        prisma.evidenciaActividad.count({
          where: {
            actividad: { faseProcesoId: fase.id },
            estado: 'APROBADA',
            deletedAt: null
          }
        })
      ]);

      let empresasVinculadas = [];
      if (proceso.tipoActivo === 'PATENTE' && fase.fase === 'MATCH') {
        empresasVinculadas = await prisma.procesoEmpresa.findMany({
          where: { procesoId, deletedAt: null },
          include: {
            empresa: { select: { id: true, razonSocial: true, ruc: true } }
          }
        });
      }

      return {
        ...fase,
        estadisticas: { actividadesTotales, actividadesCompletadas, evidenciasAprobadas },
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

    if (!proceso) throw new NotFoundError('Proceso');

    const faseProceso = await prisma.faseProceso.findFirst({
      where: { procesoId, fase, deletedAt: null },
      include: {
        responsable: {
          select: { id: true, nombres: true, apellidos: true, email: true }
        },
        decisiones: {
          include: {
            decididor: { select: { id: true, nombres: true, apellidos: true } }
          },
          orderBy: { fecha: 'desc' }
        },
        actividades: {
          where: { deletedAt: null },
          include: {
            // ✅ Incluir rol completo para poder filtrar por código
            asignaciones: {
              include: {
                rol: { select: { id: true, codigo: true, nombre: true } },
                usuario: { select: { id: true, nombres: true, apellidos: true } }
              }
            },
            evidencias: { where: { deletedAt: null } }
          }
        }
      }
    });

    if (!faseProceso) throw new NotFoundError('Fase');

    const actividades = faseProceso.actividades.map(act => ({
      id: act.id,
      nombre: act.nombre,
      descripcion: act.descripcion,
      tipo: act.tipo,
      estado: act.estado,
      obligatoria: act.obligatoria,
      fechaInicio: act.fechaInicio,
      fechaLimite: act.fechaLimite,
      // ✅ Filtrar por rol.codigo en lugar de a.rol string
      responsables: act.asignaciones
        .filter(a => a.rol.codigo === 'RESPONSABLE_TAREA')
        .map(a => ({ ...a.usuario, rol: a.rol })),
      revisores: act.asignaciones
        .filter(a => a.rol.codigo === 'REVISOR_TAREA')
        .map(a => ({ ...a.usuario, rol: a.rol })),
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
        include: { empresa: true }
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

    if (!fase) throw new NotFoundError('Fase');

    // ⚡ MAGIA ReBAC MEJORADA: Cambio de responsable
    if (data.responsableId && data.responsableId !== fase.responsableId) {
      const rolLider = await prisma.rol.findFirst({
        where: { codigo: 'LIDER_FASE', ambito: 'PROCESO', activo: true }
      });

      if (rolLider) {
        // 1. Quitar el rol al responsable ANTERIOR (si existía)
        if (fase.responsableId) {
          // ¿El responsable anterior lidera OTRA fase en este mismo proceso?
          const otrasFasesCount = await prisma.faseProceso.count({
            where: {
              procesoId: fase.procesoId,
              responsableId: fase.responsableId,
              id: { not: fase.id }, // Excluimos la fase actual
              deletedAt: null
            }
          });

          // Si ya no lidera ninguna otra fase, le revocamos el rol global de LIDER_FASE en el proceso
          if (otrasFasesCount === 0) {
            await prisma.procesoUsuario.deleteMany({
              where: {
                procesoId: fase.procesoId,
                usuarioId: fase.responsableId,
                rolId: rolLider.id
              }
            });
          }
        }

        // 2. Asignar el rol al NUEVO responsable
        await prisma.procesoUsuario.upsert({
          where: {
            procesoId_usuarioId_rolId: {
              procesoId: fase.procesoId,
              usuarioId: data.responsableId,
              rolId: rolLider.id
            }
          },
          update: {}, // Si ya lo tiene (porque lidera otra fase), no hace nada
          create: {
            procesoId: fase.procesoId,
            usuarioId: data.responsableId,
            rolId: rolLider.id
          }
        });
      }
    }

    return await prisma.faseProceso.update({ where: { id }, data });
  }
}

export default new FaseService();