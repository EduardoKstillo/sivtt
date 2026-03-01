import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import procesoService from './proceso.service.js';

// Códigos de rol para actividades (deben coincidir con los del seed)
const ROL_RESPONSABLE = 'RESPONSABLE_TAREA';
const ROL_REVISOR = 'REVISOR_TAREA';

class ActividadService {

  // ========================================
  // 📋 LISTADO
  // ========================================

  async listByProceso(procesoId, filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = { procesoId, deletedAt: null };

    if (filters.fase) where.fase = filters.fase;
    if (filters.estado) where.estado = filters.estado;
    if (filters.tipo) where.tipo = filters.tipo;

    // ✅ Filtrar por responsableId usando el código del rol en lugar del string
    if (filters.responsableId) {
      const actividadIds = await prisma.usuarioActividad.findMany({
        where: {
          usuarioId: parseInt(filters.responsableId),
          rol: { codigo: ROL_RESPONSABLE }
        },
        select: { actividadId: true }
      });

      where.id = { in: actividadIds.map(a => a.actividadId) };
    }

    const [actividades, total] = await Promise.all([
      prisma.actividadFase.findMany({
        where,
        skip,
        take,
        include: {
          asignaciones: {
            include: {
              rol: { select: { id: true, codigo: true, nombre: true } },
              usuario: { select: { id: true, nombres: true, apellidos: true } }
            }
          },
          evidencias: { where: { deletedAt: null } }
        },
        orderBy: [{ fase: 'asc' }, { orden: 'asc' }, { fechaInicio: 'asc' }]
      }),
      prisma.actividadFase.count({ where })
    ]);

    const actividadesFormateadas = actividades.map(act => ({
      ...act,
      // ✅ Clasificar por código de rol en lugar de string directo
      responsables: act.asignaciones
        .filter(a => a.rol.codigo === ROL_RESPONSABLE)
        .map(a => ({ ...a.usuario, rol: a.rol })),
      revisores: act.asignaciones
        .filter(a => a.rol.codigo === ROL_REVISOR)
        .map(a => ({ ...a.usuario, rol: a.rol })),
      evidencias: {
        total: act.evidencias.length,
        aprobadas: act.evidencias.filter(e => e.estado === 'APROBADA').length,
        pendientes: act.evidencias.filter(e => e.estado === 'PENDIENTE').length,
        rechazadas: act.evidencias.filter(e => e.estado === 'RECHAZADA').length
      }
    }));

    return buildPaginatedResponse(actividadesFormateadas, total, page, limit);
  }

  // ========================================
  // 🔍 DETALLE
  // ========================================

  async getById(id) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null },
      include: {
        proceso: { select: { codigo: true, titulo: true } },
        requisitos: true,
        asignaciones: {
          include: {
            rol: { select: { id: true, codigo: true, nombre: true } },
            usuario: { select: { id: true, nombres: true, apellidos: true, email: true } }
          }
        },
        evidencias: {
          where: { deletedAt: null },
          include: {
            subidoPor: { select: { id: true, nombres: true, apellidos: true } },
            revisadoPor: { select: { id: true, nombres: true, apellidos: true } }
          },
          orderBy: { version: 'desc' }
        },
        reunion: { include: { participantes: true } }
      }
    });

    if (!actividad) throw new NotFoundError('Actividad');

    return {
      ...actividad,
      asignaciones: actividad.asignaciones.map(a => ({
        usuario: a.usuario,
        rol: a.rol,
        asignadoAt: a.asignadoAt
      }))
    };
  }

  // ========================================
  // ➕ CREAR
  // ========================================

  async create(procesoId, data, userId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) throw new NotFoundError('Proceso');

    const fase = await prisma.faseProceso.findFirst({
      where: { procesoId, fase: data.fase, estado: 'ABIERTA', deletedAt: null }
    });

    if (!fase) throw new ValidationError('La fase debe estar ABIERTA para crear actividades');

    const orden = data.orden || await this.getNextOrden(procesoId, data.fase);

    const requisitosCreate = data.requisitos?.map(req => ({
      nombre: req.nombre,
      descripcion: req.descripcion,
      obligatorio: req.obligatorio !== false
    })) || [];

    const actividad = await prisma.actividadFase.create({
      data: {
        procesoId,
        fase: data.fase,
        faseProcesoId: fase.id,
        tipo: data.tipo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        obligatoria: data.obligatoria || false,
        orden,
        fechaInicio: data.fechaInicio || new Date(),
        fechaLimite: data.fechaLimite,
        requisitos: { create: requisitosCreate }
      },
      include: { requisitos: true }
    });

    // ✅ Asignar usando rolId en lugar de string
    if (data.responsables?.length > 0) {
      const rolResp = await this._getRolActividad(ROL_RESPONSABLE);
      await this.assignMultipleUsuarios(actividad.id, data.responsables, rolResp.id);
    }
    if (data.revisores?.length > 0) {
      const rolRevisor = await this._getRolActividad(ROL_REVISOR);
      await this.assignMultipleUsuarios(actividad.id, data.revisores, rolRevisor.id);
    }

    await this.updateProcesoCounters(procesoId);

    return actividad;
  }

  // ========================================
  // ✏️ ACTUALIZAR
  // ========================================

  async update(id, data) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { evidencias: { where: { deletedAt: null } } } } }
    });

    if (!actividad) throw new NotFoundError('Actividad');

    if (actividad.estado === 'APROBADA') {
      throw new ValidationError('No se puede modificar una actividad aprobada');
    }

    if (actividad._count.evidencias > 0) {
      throw new ValidationError('No se puede modificar una actividad que ya tiene evidencias cargadas. Elimine las evidencias primero.');
    }

    return await prisma.actividadFase.update({ where: { id }, data });
  }

  // ========================================
  // 🔄 CAMBIO DE ESTADO
  // ========================================

  async changeEstado(id, nuevoEstado, observaciones, userId) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null }
    });

    if (!actividad) throw new NotFoundError('Actividad');

    const validTransitions = {
      'CREADA': ['EN_PROGRESO'],
      'EN_PROGRESO': ['EN_REVISION', 'OBSERVADA'],
      'EN_REVISION': ['LISTA_PARA_CIERRE', 'OBSERVADA'],
      'LISTA_PARA_CIERRE': ['OBSERVADA'],
      'OBSERVADA': ['EN_PROGRESO', 'EN_REVISION'],
      'RECHAZADA': ['EN_PROGRESO'],
      'APROBADA': []
    };

    if (!validTransitions[actividad.estado].includes(nuevoEstado)) {
      throw new ValidationError(`No se puede cambiar de ${actividad.estado} a ${nuevoEstado}`);
    }

    const updateData = { estado: nuevoEstado, observaciones };

    if (nuevoEstado === 'APROBADA') {
      updateData.fechaCierre = new Date();
    }

    const [updated] = await prisma.$transaction([
      prisma.actividadFase.update({ where: { id }, data: updateData }),
      prisma.historialActividad.create({
        data: {
          procesoId: actividad.procesoId,
          actividadId: id,
          accion: 'ESTADO_CAMBIADO',
          estadoAnterior: actividad.estado,
          estadoNuevo: nuevoEstado,
          usuarioId: userId,
          metadata: { observaciones }
        }
      })
    ]);

    await this.updateProcesoCounters(actividad.procesoId);
    return updated;
  }

  // ========================================
  // 🗑️ ELIMINAR
  // ========================================

  async delete(id) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null },
      include: { _count: { select: { evidencias: { where: { deletedAt: null } } } } }
    });

    if (!actividad) throw new NotFoundError('Actividad');

    if (actividad._count.evidencias > 0) {
      throw new ValidationError('No se puede eliminar la actividad porque contiene evidencias. Elimine las evidencias primero.');
    }

    const deleted = await prisma.actividadFase.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await this.updateProcesoCounters(actividad.procesoId);
    return deleted;
  }

  // ========================================
  // 👤 ASIGNACIONES
  // ========================================

  async assignUsuario(actividadId, usuarioId, rolId) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id: actividadId, deletedAt: null },
      include: { asignaciones: { include: { rol: true } } }
    });

    if (!actividad) throw new NotFoundError('Actividad');

    // ✅ Validar que el rol existe y es de ámbito ACTIVIDAD
    const rol = await prisma.rol.findFirst({
      where: { id: rolId, ambito: 'ACTIVIDAD', activo: true }
    });

    if (!rol) throw new ValidationError('El rol no existe o no es de ámbito ACTIVIDAD');

    // No puede ser RESPONSABLE y REVISOR a la vez
    if (rol.codigo === ROL_REVISOR) {
      const esResponsable = actividad.asignaciones.some(
        a => a.usuarioId === usuarioId && a.rol.codigo === ROL_RESPONSABLE
      );
      if (esResponsable) {
        throw new ValidationError('Un usuario no puede ser RESPONSABLE y REVISOR de la misma actividad');
      }
    }

    if (rol.codigo === ROL_RESPONSABLE) {
      const esRevisor = actividad.asignaciones.some(
        a => a.usuarioId === usuarioId && a.rol.codigo === ROL_REVISOR
      );
      if (esRevisor) {
        throw new ValidationError('Un usuario no puede ser REVISOR y RESPONSABLE de la misma actividad');
      }
    }

    const existing = await prisma.usuarioActividad.findFirst({
      where: { actividadId, usuarioId, rolId }
    });

    if (existing) throw new ValidationError('El usuario ya tiene este rol en la actividad');

    return await prisma.usuarioActividad.create({
      data: { actividadId, usuarioId, rolId },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true } },
        rol: { select: { id: true, codigo: true, nombre: true } }
      }
    });
  }

  async removeUsuario(actividadId, usuarioId) {
    await prisma.usuarioActividad.deleteMany({ where: { actividadId, usuarioId } });
  }

  async assignMultipleUsuarios(actividadId, usuarioIds, rolId) {
    await prisma.usuarioActividad.createMany({
      data: usuarioIds.map(usuarioId => ({ actividadId, usuarioId, rolId })),
      skipDuplicates: true
    });
  }

  // ========================================
  // ✅ APROBAR
  // ========================================

  async aprobar(id, userId) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null },
      include: {
        requisitos: true,
        evidencias: {
          where: { deletedAt: null },
          orderBy: { version: 'asc' }
        }
      }
    });

    if (!actividad) throw new NotFoundError('Actividad');

    if (actividad.estado !== 'LISTA_PARA_CIERRE') {
      throw new ValidationError(
        `Solo se pueden aprobar actividades en estado LISTA_PARA_CIERRE (actual: ${actividad.estado})`
      );
    }

    // Mapa de última versión por requisito
    const ultimasVersionesMap = new Map();

    actividad.evidencias.forEach(ev => {
      const key = ev.requisitoId ? `req-${ev.requisitoId}` : `extra-${ev.id}`;
      const guardada = ultimasVersionesMap.get(key);
      if (!guardada || ev.version > guardada.version) {
        ultimasVersionesMap.set(key, ev);
      }
    });

    const requisitosObligatorios = actividad.requisitos.filter(r => r.obligatorio);

    for (const req of requisitosObligatorios) {
      const key = `req-${req.id}`;
      const evidencia = ultimasVersionesMap.get(key);

      if (!evidencia) {
        throw new ValidationError(`Falta evidencia para el requisito obligatorio: ${req.nombre}`);
      }

      if (evidencia.estado !== 'APROBADA') {
        throw new ValidationError(`La evidencia para "${req.nombre}" no está aprobada (Estado actual: ${evidencia.estado})`);
      }
    }

    const [updated] = await prisma.$transaction([
      prisma.actividadFase.update({
        where: { id },
        data: { estado: 'APROBADA', fechaCierre: new Date() }
      }),
      prisma.historialActividad.create({
        data: {
          procesoId: actividad.procesoId,
          actividadId: id,
          accion: 'APROBADA',
          estadoAnterior: 'LISTA_PARA_CIERRE',
          estadoNuevo: 'APROBADA',
          usuarioId: userId
        }
      })
    ]);

    await this.updateProcesoCounters(actividad.procesoId);
    return updated;
  }

  // ========================================
  // ⚡ RECALCULAR ESTADO AUTOMÁTICO
  // ========================================

  async recalculateState(actividadId) {
    const actividad = await prisma.actividadFase.findUnique({
      where: { id: actividadId },
      include: {
        requisitos: true,
        evidencias: {
          where: { deletedAt: null },
          orderBy: { version: 'desc' }
        },
        // ✅ Incluir rol para poder filtrar por código
        asignaciones: {
          include: { rol: { select: { codigo: true } } }
        }
      }
    });

    if (!actividad) return;
    if (actividad.estado === 'APROBADA') return;

    const estadoPorRequisito = new Map();
    const estadoEvidenciasExtra = [];

    for (const ev of actividad.evidencias) {
      if (ev.requisitoId) {
        if (!estadoPorRequisito.has(ev.requisitoId)) {
          estadoPorRequisito.set(ev.requisitoId, ev.estado);
        }
      } else {
        estadoEvidenciasExtra.push(ev.estado);
      }
    }

    const estadosRelevantes = [
      ...Array.from(estadoPorRequisito.values()),
      ...estadoEvidenciasExtra
    ];

    const hayRechazadas = estadosRelevantes.includes('RECHAZADA');
    const hayPendientes = estadosRelevantes.includes('PENDIENTE');
    const hayAprobadas = estadosRelevantes.includes('APROBADA');

    const requisitosObligatorios = actividad.requisitos.filter(r => r.obligatorio);

    const estanTodosObligatoriosAprobados = requisitosObligatorios.every(req =>
      estadoPorRequisito.get(req.id) === 'APROBADA'
    );

    let nuevoEstado = actividad.estado;

    if (hayRechazadas) {
      nuevoEstado = 'OBSERVADA';
    } else if (hayPendientes) {
      // ✅ Verificar si hay un REVISOR usando el código del rol
      const hayRevisor = actividad.asignaciones.some(
        a => a.rol.codigo === ROL_REVISOR
      );
      nuevoEstado = hayRevisor ? 'EN_REVISION' : 'EN_PROGRESO';
    } else {
      if (estanTodosObligatoriosAprobados) {
        nuevoEstado = 'LISTA_PARA_CIERRE';
      } else if (hayAprobadas || estadosRelevantes.length > 0) {
        nuevoEstado = 'EN_PROGRESO';
      } else {
        if (nuevoEstado !== 'CREADA') nuevoEstado = 'EN_PROGRESO';
      }
    }

    if (nuevoEstado !== actividad.estado) {
      console.log(`⚡ Cambio de estado automático: ${actividad.estado} -> ${nuevoEstado}`);
      await prisma.actividadFase.update({
        where: { id: actividadId },
        data: { estado: nuevoEstado }
      });
    }
  }

  // ========================================
  // 🔧 UTILIDADES INTERNAS
  // ========================================

  async getNextOrden(procesoId, fase) {
    const maxOrden = await prisma.actividadFase.findFirst({
      where: { procesoId, fase, deletedAt: null },
      orderBy: { orden: 'desc' },
      select: { orden: true }
    });
    return (maxOrden?.orden || 0) + 1;
  }

  async updateProcesoCounters(procesoId) {
    await procesoService.updateStats(procesoId);
  }

  // Obtener rol de actividad por código (con caché implícita por ser singleton)
  async _getRolActividad(codigo) {
    const rol = await prisma.rol.findFirst({
      where: { codigo, ambito: 'ACTIVIDAD', activo: true }
    });

    if (!rol) {
      throw new ValidationError(
        `Rol de actividad "${codigo}" no encontrado. Verifique que el seed fue ejecutado correctamente.`
      );
    }

    return rol;
  }
}

export default new ActividadService();