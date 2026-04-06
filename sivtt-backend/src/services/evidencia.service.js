import prisma from '../config/database.js';
import actividadService from './actividad.service.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import { getPagination } from '../utils/pagination.js';

const ROL_RESPONSABLE = 'RESPONSABLE_TAREA';
const ROL_REVISOR = 'REVISOR_TAREA';

class EvidenciaService {
  // ========================================
  // 🔧 UTILIDAD INTERNA: Formateo de URLs
  // ========================================
  _formatEvidenciaUrl(evidencia) {
    if (!evidencia || !evidencia.urlArchivo) return evidencia;
    if (evidencia.urlArchivo.startsWith('http')) return evidencia;

    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    const cleanPath = evidencia.urlArchivo.startsWith('/') ? evidencia.urlArchivo : `/${evidencia.urlArchivo}`;

    return {
      ...evidencia,
      urlArchivo: `${baseUrl}${cleanPath}`
    };
  }

  // ========================================
  // 📋 MÉTODOS PÚBLICOS
  // ========================================

  async listByProceso(procesoId, filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = { actividad: { procesoId }, deletedAt: null };

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
          actividad: { select: { id: true, nombre: true, fase: true } },
          subidoPor: { select: { id: true, nombres: true, apellidos: true } },
          // ✅ INCLUIMOS LAS EVALUACIONES DE LOS REVISORES
          evaluaciones: {
            include: { revisor: { select: { id: true, nombres: true, apellidos: true } } }
          }
        },
        orderBy: [{ fase: 'asc' }, { createdAt: 'desc' }]
      }),
      prisma.evidenciaActividad.count({ where })
    ]);

    const agrupacion = await this.getAgrupacionPorFase(procesoId);
    const evidenciasFormateadas = evidencias.map(ev => this._formatEvidenciaUrl(ev));

    return {
      evidencias: evidenciasFormateadas,
      agrupacion,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  async getById(id) {
    const evidencia = await prisma.evidenciaActividad.findFirst({
      where: { id, deletedAt: null },
      include: {
        actividad: { select: { id: true, nombre: true, fase: true } },
        subidoPor: { select: { id: true, nombres: true, apellidos: true, email: true } },
        // ✅ INCLUIMOS LAS EVALUACIONES
        evaluaciones: {
          include: { revisor: { select: { id: true, nombres: true, apellidos: true } } }
        }
      }
    });

    if (!evidencia) throw new NotFoundError('Evidencia');
    return this._formatEvidenciaUrl(evidencia);
  }

  async create(actividadId, data, userId) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id: actividadId, deletedAt: null },
      include: { asignaciones: { include: { rol: { select: { codigo: true } } } } }
    });

    if (!actividad) throw new NotFoundError('Actividad');
    if (actividad.estado === 'APROBADA') throw new ValidationError('No se pueden subir evidencias a una actividad cerrada');

    const isResponsable = actividad.asignaciones.some(a => a.usuarioId === userId && a.rol.codigo === ROL_RESPONSABLE);
    if (!isResponsable) throw new ForbiddenError('Solo el responsable puede subir evidencias');

    let version = 1;
    let requisitoId = data.requisitoId ? parseInt(data.requisitoId) : null;

    if (requisitoId) {
      const ultimaEvidencia = await prisma.evidenciaActividad.findFirst({
        where: { actividadId, requisitoId, deletedAt: null },
        orderBy: { version: 'desc' },
        include: { evaluaciones: true }
      });
      if (ultimaEvidencia) {
        const totalRevisoresAsignados = actividad.asignaciones.filter(
          a => a.rol.codigo === ROL_REVISOR
        ).length;

        // ✅ REGLA DE NEGOCIO: Bloquear v2 si v1 no ha sido evaluada por TODOS
        if (ultimaEvidencia.evaluaciones.length < totalRevisoresAsignados) {
          throw new ValidationError('Debes esperar a que todos los revisores terminen de evaluar la versión actual antes de subir una corrección.');
        }

        version = ultimaEvidencia.version + 1;
      }
    }

    const evidencia = await prisma.$transaction(async (tx) => {
      const newEvidencia = await tx.evidenciaActividad.create({
        data: {
          actividadId,
          requisitoId,
          tipoEvidencia: data.tipoEvidencia,
          nombreArchivo: data.nombreArchivo,
          urlArchivo: data.urlArchivo,
          tamaño: data.tamaño,
          version,
          fase: actividad.fase,
          descripcion: data.descripcion,
          estado: 'PENDIENTE',
          subidoPorId: userId
        }
      });

      await tx.historialActividad.create({
        data: {
          procesoId: actividad.procesoId,
          actividadId,
          accion: 'EVIDENCIA_SUBIDA',
          usuarioId: userId,
          metadata: { evidenciaId: newEvidencia.id, nombreArchivo: data.nombreArchivo, version }
        }
      });

      return newEvidencia;
    });

    await actividadService.recalculateState(actividadId);
    return this._formatEvidenciaUrl(evidencia);
  }

  // ========================================
  // ⚖️ EL MOTOR DE CONSENSO (Múltiples votos)
  // ========================================
  async review(id, decisionRevisor, comentarioRevision, userId) {
    const evidencia = await prisma.evidenciaActividad.findFirst({
      where: { id, deletedAt: null },
      include: {
        actividad: {
          select: {
            procesoId: true,
            estado: true,
            // ✅ Traemos las asignaciones para saber cuántos revisores hay
            asignaciones: { include: { rol: true } }
          }
        }
      }
    });

    if (!evidencia) throw new NotFoundError('Evidencia');
    if (evidencia.actividad.estado === 'APROBADA') {
      throw new ValidationError('No se puede revisar una evidencia de una actividad finalizada.');
    }

    // ✅ REGLA DE NEGOCIO: Prohibir votar o cambiar votos en versiones antiguas
    if (evidencia.requisitoId) {
      const versionMasReciente = await prisma.evidenciaActividad.findFirst({
        where: {
          actividadId: evidencia.actividadId,
          requisitoId: evidencia.requisitoId,
          version: { gt: evidencia.version }, // Buscamos si existe una versión mayor
          deletedAt: null
        }
      });

      if (versionMasReciente) {
        throw new ValidationError('No puedes evaluar ni cambiar tu voto en una versión antigua. Solo la versión más reciente es válida.');
      }
    }

    const updatedEvidencia = await prisma.$transaction(async (tx) => {

      // 1. Guardar/Actualizar el voto (evaluación) de ESTE revisor
      await tx.evaluacionEvidencia.upsert({
        where: { evidenciaId_revisorId: { evidenciaId: id, revisorId: userId } },
        update: { estado: decisionRevisor, comentario: comentarioRevision },
        create: {
          evidenciaId: id,
          revisorId: userId,
          estado: decisionRevisor,
          comentario: comentarioRevision
        }
      });

      // 2. Obtener TODOS los votos de la evidencia
      const todasLasEvaluaciones = await tx.evaluacionEvidencia.findMany({
        where: { evidenciaId: id }
      });

      // 3. 🧠 ALGORITMO DE CONSENSO UNÁNIME
      let nuevoEstadoGlobal = 'PENDIENTE';

      // Regla del Veto: Si hay al menos 1 rechazo, la evidencia global se rechaza
      const hayRechazo = todasLasEvaluaciones.some(e => e.estado === 'RECHAZADA');

      if (hayRechazo) {
        nuevoEstadoGlobal = 'RECHAZADA';
      }
      else {
        // ✅ CORRECCIÓN: Contamos cuántos usuarios tienen el rol de REVISOR en esta actividad
        const totalRevisoresAsignados = evidencia.actividad.asignaciones.filter(
          a => a.rol.codigo === 'REVISOR_TAREA'
        ).length;

        // Solo se aprueba si TODOS los revisores asignados ya emitieron su voto positivo
        // Si hay 3 revisores, necesitamos 3 evaluaciones y las 3 deben ser 'APROBADA'
        const todosVotaron = todasLasEvaluaciones.length >= totalRevisoresAsignados;
        const todosAprobaron = todasLasEvaluaciones.every(e => e.estado === 'APROBADA');

        if (todosVotaron && todosAprobaron && totalRevisoresAsignados > 0) {
          nuevoEstadoGlobal = 'APROBADA';
        }
      }

      // 4. Actualizar el estado global de la evidencia
      const evidenciaActualizada = await tx.evidenciaActividad.update({
        where: { id },
        data: { estado: nuevoEstadoGlobal },
        include: {
          actividad: true,
          evaluaciones: { include: { revisor: { select: { id: true, nombres: true, apellidos: true } } } }
        }
      });

      // 5. Historial Formal
      const accionHistorial = decisionRevisor === 'APROBADA' ? 'VOTO_APROBADO' : 'VOTO_RECHAZADO';
      await tx.historialActividad.create({
        data: {
          procesoId: evidenciaActualizada.actividad.procesoId,
          actividadId: evidenciaActualizada.actividadId,
          accion: accionHistorial,
          usuarioId: userId,
          metadata: { evidenciaId: id, comentario: comentarioRevision, estadoGlobal: nuevoEstadoGlobal }
        }
      });

      // 6. Inyección en el Chat (ComentarioActividad)
      const tipoMensaje = decisionRevisor === 'APROBADA' ? 'REVISION_APROBADA' : 'REVISION_RECHAZADA';
      const textoChat = decisionRevisor === 'APROBADA'
        ? `Ha aprobado el documento "${evidencia.nombreArchivo}" (v${evidencia.version}).`
        : `Ha rechazado el documento "${evidencia.nombreArchivo}" (v${evidencia.version}). Motivo: ${comentarioRevision}`;

      await tx.comentarioActividad.create({
        data: {
          actividadId: evidenciaActualizada.actividadId,
          usuarioId: userId,
          texto: textoChat,
          tipo: tipoMensaje,
          evidenciaId: id
        }
      });

      return evidenciaActualizada;
    });

    // 7. Recalcular el estado de la actividad padre
    await actividadService.recalculateState(updatedEvidencia.actividadId);

    return this._formatEvidenciaUrl(updatedEvidencia);
  }

  async delete(id) {
    const evidencia = await prisma.evidenciaActividad.findFirst({
      where: { id, deletedAt: null },
      include: { actividad: true }
    });

    if (!evidencia) throw new NotFoundError('Evidencia');
    if (evidencia.actividad.estado === 'APROBADA') throw new ValidationError('No se puede eliminar evidencia de una actividad aprobada/cerrada');
    if (evidencia.estado !== 'PENDIENTE') throw new ValidationError('No se puede eliminar una evidencia que ya tiene evaluaciones. Suba una nueva versión en su lugar.');

    const deleted = await prisma.evidenciaActividad.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await actividadService.recalculateState(evidencia.actividadId);
    return this._formatEvidenciaUrl(deleted);
  }

  async checkAllEvidenciasAprobadas(actividadId) {
    const evidencias = await prisma.evidenciaActividad.findMany({
      where: { actividadId, deletedAt: null }
    });

    const allAprobadas = evidencias.length > 0 && evidencias.every(e => e.estado === 'APROBADA');

    if (allAprobadas) {
      await prisma.actividadFase.update({
        where: { id: actividadId },
        data: { estado: 'LISTA_PARA_CIERRE' }
      });
    }
  }

  async getAgrupacionPorFase(procesoId) {
    const agrupacion = await prisma.evidenciaActividad.groupBy({
      by: ['fase', 'estado'],
      where: { actividad: { procesoId }, deletedAt: null },
      _count: true
    });

    const resultado = {};
    agrupacion.forEach(row => {
      if (!resultado[row.fase]) resultado[row.fase] = { total: 0, aprobadas: 0, pendientes: 0, rechazadas: 0 };
      resultado[row.fase].total += row._count;

      switch (row.estado) {
        case 'APROBADA': resultado[row.fase].aprobadas = row._count; break;
        case 'PENDIENTE': resultado[row.fase].pendientes = row._count; break;
        case 'RECHAZADA': resultado[row.fase].rechazadas = row._count; break;
      }
    });

    return resultado;
  }
}

export default new EvidenciaService();