import prisma from '../config/database.js';
import actividadService from './actividad.service.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

// Códigos de rol para actividades (deben coincidir con el seed)
const ROL_RESPONSABLE = 'RESPONSABLE_TAREA';
const ROL_REVISOR = 'REVISOR_TAREA';

class EvidenciaService {
  // ========================================
  // 🔧 UTILIDAD INTERNA: Formateo de URLs
  // ========================================
  _formatEvidenciaUrl(evidencia) {
    if (!evidencia || !evidencia.urlArchivo) return evidencia;
    // Si ya es una URL externa (ej: un enlace de Drive o S3), la dejamos intacta
    if (evidencia.urlArchivo.startsWith('http')) return evidencia;

    // Tomamos la URL del servidor desde las variables de entorno (con fallback local)
    // El frontend ya no tiene que adivinar dónde está el backend.
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
          actividad: { select: { id: true, nombre: true, fase: true } },
          subidoPor: { select: { id: true, nombres: true, apellidos: true } },
          revisadoPor: { select: { id: true, nombres: true, apellidos: true } }
        },
        orderBy: [{ fase: 'asc' }, { createdAt: 'desc' }]
      }),
      prisma.evidenciaActividad.count({ where })
    ]);

    const agrupacion = await this.getAgrupacionPorFase(procesoId);

    // ✅ Formateamos todas las evidencias antes de enviarlas
    const evidenciasFormateadas = evidencias.map(ev => this._formatEvidenciaUrl(ev));

    return {
      evidencias: evidenciasFormateadas,
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
        actividad: { select: { id: true, nombre: true, fase: true } },
        subidoPor: { select: { id: true, nombres: true, apellidos: true, email: true } },
        revisadoPor: { select: { id: true, nombres: true, apellidos: true, email: true } }
      }
    });

    if (!evidencia) throw new NotFoundError('Evidencia');

    // ✅ Retornamos la evidencia formateada
    return this._formatEvidenciaUrl(evidencia);
  }

  async create(actividadId, data, userId) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id: actividadId, deletedAt: null },
      include: {
        asignaciones: {
          include: {
            rol: { select: { codigo: true } }
          }
        }
      }
    });

    if (!actividad) throw new NotFoundError('Actividad');

    if (actividad.estado === 'APROBADA') {
      throw new ValidationError('No se pueden subir evidencias a una actividad cerrada');
    }

    const isResponsable = actividad.asignaciones.some(
      a => a.usuarioId === userId && a.rol.codigo === ROL_RESPONSABLE
    );

    if (!isResponsable) {
      throw new ForbiddenError('Solo el responsable puede subir evidencias');
    }

    let version = 1;
    let requisitoId = data.requisitoId ? parseInt(data.requisitoId) : null;

    if (requisitoId) {
      const ultimaEvidencia = await prisma.evidenciaActividad.findFirst({
        where: { actividadId, requisitoId, deletedAt: null },
        orderBy: { version: 'desc' }
      });

      if (ultimaEvidencia) {
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
          urlArchivo: data.urlArchivo, // Se guarda relativo en la BD
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
          metadata: {
            evidenciaId: newEvidencia.id,
            nombreArchivo: data.nombreArchivo,
            version
          }
        }
      });

      return newEvidencia;
    });

    await actividadService.recalculateState(actividadId);

    // ✅ Retornamos la evidencia recién creada con su URL absoluta
    return this._formatEvidenciaUrl(evidencia);
  }

  async review(id, nuevoEstado, comentarioRevision, userId) {
    const evidencia = await prisma.evidenciaActividad.findFirst({
      where: { id, deletedAt: null },
      include: {
        actividad: {
          include: {
            asignaciones: {
              include: {
                rol: { select: { codigo: true } }
              }
            }
          }
        }
      }
    });

    if (!evidencia) throw new NotFoundError('Evidencia');

    const asignacion = evidencia.actividad.asignaciones.find(
      a => a.usuarioId === userId
    );

    if (!asignacion) {
      throw new ForbiddenError('No estás asignado a esta actividad');
    }

    if (asignacion.rol.codigo !== ROL_REVISOR) {
      throw new ForbiddenError('Solo revisores pueden revisar evidencias');
    }

    const updated = await prisma.$transaction(async (tx) => {
      const evidenciaActualizada = await tx.evidenciaActividad.update({
        where: { id },
        data: {
          estado: nuevoEstado,
          comentarioRevision,
          revisadoPorId: userId,
          fechaRevision: new Date()
        },
        include: { actividad: true }
      });

      const accion = nuevoEstado === 'APROBADA' ? 'EVIDENCIA_APROBADA' : 'EVIDENCIA_RECHAZADA';
      await tx.historialActividad.create({
        data: {
          procesoId: evidenciaActualizada.actividad.procesoId,
          actividadId: evidenciaActualizada.actividadId,
          accion,
          usuarioId: userId,
          metadata: { evidenciaId: id, comentario: comentarioRevision }
        }
      });

      return evidenciaActualizada;
    });

    await actividadService.recalculateState(updated.actividadId);

    // ✅ Formateamos antes de devolver
    return this._formatEvidenciaUrl(updated);
  }

  async delete(id) {
    const evidencia = await prisma.evidenciaActividad.findFirst({
      where: { id, deletedAt: null },
      include: { actividad: true }
    });

    if (!evidencia) throw new NotFoundError('Evidencia');

    if (evidencia.actividad.estado === 'APROBADA') {
      throw new ValidationError('No se puede eliminar evidencia de una actividad aprobada/cerrada');
    }

    if (evidencia.estado !== 'PENDIENTE') {
      throw new ValidationError('No se puede eliminar una evidencia que ya ha sido revisada. Suba una nueva versión en su lugar.');
    }

    const deleted = await prisma.evidenciaActividad.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await actividadService.recalculateState(evidencia.actividadId);

    // ✅ Formateamos el retorno por consistencia
    return this._formatEvidenciaUrl(deleted);
  }

  async checkAllEvidenciasAprobadas(actividadId) {
    const evidencias = await prisma.evidenciaActividad.findMany({
      where: { actividadId, deletedAt: null }
    });

    const allAprobadas = evidencias.length > 0 &&
      evidencias.every(e => e.estado === 'APROBADA');

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
      if (!resultado[row.fase]) {
        resultado[row.fase] = { total: 0, aprobadas: 0, pendientes: 0, rechazadas: 0 };
      }
      resultado[row.fase].total += row._count;

      switch (row.estado) {
        case 'APROBADA':  resultado[row.fase].aprobadas  = row._count; break;
        case 'PENDIENTE': resultado[row.fase].pendientes = row._count; break;
        case 'RECHAZADA': resultado[row.fase].rechazadas = row._count; break;
      }
    });

    return resultado;
  }
}

export default new EvidenciaService();