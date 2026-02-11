import prisma from '../config/database.js';
import actividadService from './actividad.service.js';
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
    // 1️⃣ Buscar actividad
    const actividad = await prisma.actividadFase.findFirst({
      where: { id: actividadId, deletedAt: null },
      include: { asignaciones: true } // Para validar roles y revisor
    });

    if (!actividad) {
      throw new NotFoundError('Actividad');
    }

    if (actividad.estado === 'APROBADA') {
      throw new ValidationError('No se pueden subir evidencias a una actividad cerrada');
    }

    // 2️⃣ Validar que el usuario sea responsable
    const isResponsable = actividad.asignaciones.some(
      a => a.usuarioId === userId && a.rol === 'RESPONSABLE'
    );

    if (!isResponsable) {
      throw new ForbiddenError('Solo el responsable puede subir evidencias');
    }

    // 3️⃣ Determinar requisito y versión
    let version = 1;
    let requisitoId = data.requisitoId ? parseInt(data.requisitoId) : null;

    // Si viene requisitoId, buscamos la versión anterior
    if (requisitoId) {
      const ultimaEvidencia = await prisma.evidenciaActividad.findFirst({
        where: { 
          actividadId, 
          requisitoId,
          deletedAt: null 
        },
        orderBy: { version: 'desc' }
      });

      if (ultimaEvidencia) {
        version = ultimaEvidencia.version + 1;
        // Nota: La anterior queda como historial automáticamente al crear esta nueva con versión mayor
      }
    } else {
      // Si suben un archivo "suelto" (sin requisito), tratamos de autodetectar o versión 1
      // Por simplicidad, versión 1 si es suelto.
      version = 1;
    }

    // 2. Crear Evidencia
    const evidencia = await prisma.$transaction(async (tx) => {
      const newEvidencia = await tx.evidenciaActividad.create({
        data: {
          actividadId,
          requisitoId, // 🔥 Vinculación lógica
          tipoEvidencia: data.tipoEvidencia,
          nombreArchivo: data.nombreArchivo,
          urlArchivo: data.urlArchivo,
          tamaño: data.tamaño,
          version,     // 🔥 Versión calculada
          fase: actividad.fase,
          descripcion: data.descripcion,
          estado: 'PENDIENTE', // Siempre nace pendiente
          subidoPorId: userId
        }
      });

      // Historial
      await tx.historialActividad.create({
        data: {
          procesoId: actividad.procesoId,
          actividadId,
          accion: 'EVIDENCIA_SUBIDA',
          usuarioId: userId,
          metadata: {
            evidenciaId: newEvidencia.id,
            nombreArchivo: data.nombreArchivo,
            version
          }
        }
      });

      return newEvidencia;
    });

    // 3. 🔥 TRIGGER: Recalcular estado de la actividad
    // Esto moverá la actividad a 'EN_PROGRESO', 'EN_REVISION', etc.
    await actividadService.recalculateState(actividadId);

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

    const updated = await prisma.$transaction(async (tx) => {
        // Actualizar evidencia
        const evidencia = await tx.evidenciaActividad.update({
            where: { id },
            data: {
                estado: nuevoEstado,
                comentarioRevision,
                revisadoPorId: userId,
                fechaRevision: new Date()
            },
            include: { actividad: true } // Necesitamos el ID de actividad
        });

        // Historial
        const accion = nuevoEstado === 'APROBADA' ? 'EVIDENCIA_APROBADA' : 'EVIDENCIA_RECHAZADA';
        await tx.historialActividad.create({
            data: {
                procesoId: evidencia.actividad.procesoId,
                actividadId: evidencia.actividadId,
                accion,
                usuarioId: userId,
                metadata: {
                    evidenciaId: id,
                    comentario: comentarioRevision
                }
            }
        });
        
        return evidencia;
    });

    // 3. 🔥 TRIGGER: Recalcular estado de la actividad
    // Si se rechazó, pasará a OBSERVADA. Si se aprobó todo, a LISTA_PARA_CIERRE.
    await actividadService.recalculateState(updated.actividadId);

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
      throw new ValidationError('No se puede eliminar evidencia de una actividad aprobada/cerrada');
    }

    // 🔥 REGLA NUEVA: Solo borrar si es PENDIENTE
    if (evidencia.estado !== 'PENDIENTE') {
        throw new ValidationError('No se puede eliminar una evidencia que ya ha sido revisada (Aprobada o Rechazada). Suba una nueva versión en su lugar.');
    }

    const deleted = await prisma.evidenciaActividad.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    
    // Recalcular estado de actividad (podría volver a CREADA o EN_PROGRESO)
    await actividadService.recalculateState(evidencia.actividadId);

    return deleted;
  }

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