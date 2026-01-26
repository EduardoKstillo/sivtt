// services/reunion.service.js
import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class ReunionService {
  /**
   * Listar reuniones de un proceso
   */
  async listByProceso(procesoId, filters) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      actividad: { procesoId },
      deletedAt: null
    };

    if (filters.realizada !== undefined) {
      where.realizada = filters.realizada === 'true';
    }

    if (filters.fecha_desde) {
      where.fechaProgramada = { gte: new Date(filters.fecha_desde) };
    }

    if (filters.fecha_hasta) {
      if (where.fechaProgramada) {
        where.fechaProgramada.lte = new Date(filters.fecha_hasta);
      } else {
        where.fechaProgramada = { lte: new Date(filters.fecha_hasta) };
      }
    }

    const [reuniones, total] = await Promise.all([
      prisma.reunionActividad.findMany({
        where,
        skip,
        take,
        include: {
          actividad: {
            select: {
              id: true,
              nombre: true,
              fase: true,
              tipo: true
            }
          },
          participantes: {
            include: {
              usuario: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true
                }
              }
            }
          }
        },
        orderBy: { fechaProgramada: 'desc' }
      }),
      prisma.reunionActividad.count({ where })
    ]);

    return buildPaginatedResponse(reuniones, total, page, limit);
  }

  /**
   * Obtener detalle de reunión
   */
  async getById(id) {
    const reunion = await prisma.reunionActividad.findFirst({
      where: { id, deletedAt: null },
      include: {
        actividad: {
          include: {
            proceso: {
              select: {
                id: true,
                codigo: true,
                titulo: true
              }
            }
          }
        },
        participantes: {
          include: {
            usuario: {
              select: {
                id: true,
                nombres: true,
                apellidos: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!reunion) {
      throw new NotFoundError('Reunión');
    }

    return reunion;
  }

  /**
   * Crear reunión asociada a una actividad
   */
  async create(actividadId, data) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id: actividadId, deletedAt: null }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad');
    }

    if (actividad.tipo !== 'REUNION') {
      throw new ValidationError('Solo actividades tipo REUNION pueden tener reunión asociada');
    }

    // Validar que no exista ya una reunión para esta actividad
    const existing = await prisma.reunionActividad.findFirst({
      where: { actividadId, deletedAt: null }
    });

    if (existing) {
      throw new ValidationError('Esta actividad ya tiene una reunión asociada');
    }

    // Validar fecha futura
    if (new Date(data.fechaProgramada) < new Date()) {
      throw new ValidationError('La fecha de la reunión debe ser futura');
    }

    return await prisma.reunionActividad.create({
      data: {
        actividadId,
        fechaProgramada: data.fechaProgramada,
        duracionMinutos: data.duracionMinutos || 60,
        meetLink: this.generateMeetLink(),
        calendarLink: this.generateCalendarLink(data.fechaProgramada),
        participantes: {
          create: (data.participantes || []).map(p => ({
            usuarioId: p.usuarioId || null,
            nombre: p.nombre || null,
            email: p.email,
            rol: p.rol || null,
            confirmado: false,
            asistio: false
          }))
        }
      },
      include: {
        participantes: true
      }
    });
  }

  /**
   * Actualizar reunión
   */
  async update(id, data) {
    const reunion = await prisma.reunionActividad.findFirst({
      where: { id, deletedAt: null }
    });

    if (!reunion) {
      throw new NotFoundError('Reunión');
    }

    if (reunion.realizada) {
      throw new ValidationError('No se puede modificar una reunión ya realizada');
    }

    // Si cambia la fecha, validar que sea futura
    if (data.fechaProgramada) {
      if (new Date(data.fechaProgramada) < new Date()) {
        throw new ValidationError('La nueva fecha de la reunión debe ser futura');
      }
    }

    return await prisma.reunionActividad.update({
      where: { id },
      data: {
        fechaProgramada: data.fechaProgramada,
        duracionMinutos: data.duracionMinutos
      }
    });
  }

  /**
   * Completar reunión (marcar como realizada)
   */
  async completar(id, data) {
    const reunion = await prisma.reunionActividad.findFirst({
      where: { id, deletedAt: null },
      include: {
        participantes: true,
        actividad: {
          select: {
            id: true,
            estado: true
          }
        }
      }
    });

    if (!reunion) {
      throw new NotFoundError('Reunión');
    }

    if (reunion.realizada) {
      throw new ValidationError('La reunión ya fue marcada como realizada');
    }

    // Transacción para actualizar reunión y asistencias
    const updated = await prisma.$transaction(async (tx) => {
      // Actualizar reunión
      const reunionActualizada = await tx.reunionActividad.update({
        where: { id },
        data: {
          realizada: true,
          fechaRealizacion: new Date(),
          resumen: data.resumen,
          acuerdos: data.acuerdos
        }
      });

      // Actualizar asistencias si se proporcionan
      if (data.asistencias && data.asistencias.length > 0) {
        await Promise.all(
          data.asistencias.map(asistencia =>
            tx.participanteReunion.update({
              where: { id: asistencia.participanteId },
              data: { asistio: asistencia.asistio }
            })
          )
        );
      }

      // Si la actividad está EN_PROGRESO, cambiar a EN_REVISION
      if (reunion.actividad.estado === 'EN_PROGRESO') {
        await tx.actividadFase.update({
          where: { id: reunion.actividadId },
          data: { estado: 'EN_REVISION' }
        });
      }

      return reunionActualizada;
    });

    return updated;
  }

  /**
   * Agregar participante a reunión
   */
  async addParticipante(reunionId, data) {
    const reunion = await prisma.reunionActividad.findFirst({
      where: { id: reunionId, deletedAt: null }
    });

    if (!reunion) {
      throw new NotFoundError('Reunión');
    }

    if (reunion.realizada) {
      throw new ValidationError('No se pueden agregar participantes a una reunión ya realizada');
    }

    // Validar que no exista ya el participante por email
    const existing = await prisma.participanteReunion.findFirst({
      where: {
        reunionId,
        email: data.email
      }
    });

    if (existing) {
      throw new ValidationError(`El participante con email ${data.email} ya está agregado a esta reunión`);
    }

    return await prisma.participanteReunion.create({
      data: {
        reunionId,
        usuarioId: data.usuarioId || null,
        nombre: data.nombre || null,
        email: data.email,
        rol: data.rol || null,
        confirmado: false,
        asistio: false
      }
    });
  }

  /**
   * Remover participante de reunión
   */
  async removeParticipante(reunionId, participanteId) {
    const reunion = await prisma.reunionActividad.findFirst({
      where: { id: reunionId, deletedAt: null }
    });

    if (!reunion) {
      throw new NotFoundError('Reunión');
    }

    if (reunion.realizada) {
      throw new ValidationError('No se pueden remover participantes de una reunión ya realizada');
    }

    const participante = await prisma.participanteReunion.findFirst({
      where: { id: participanteId, reunionId }
    });

    if (!participante) {
      throw new NotFoundError('Participante no encontrado en esta reunión');
    }

    await prisma.participanteReunion.delete({
      where: { id: participanteId }
    });
  }

  /**
   * Generar link de Google Meet (mock)
   * TODO: Integrar con Google Calendar API
   */
  generateMeetLink() {
    const randomId = Math.random().toString(36).substring(2, 12);
    return `https://meet.google.com/${randomId}`;
  }

  /**
   * Generar link de Google Calendar (mock)
   * TODO: Integrar con Google Calendar API
   */
  generateCalendarLink(fecha) {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `https://calendar.google.com/calendar/event?eid=mock_${year}${month}${day}`;
  }
}

export default new ReunionService();