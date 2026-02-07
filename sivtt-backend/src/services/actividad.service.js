import prisma from '../config/database.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import procesoService from './proceso.service.js';

class ActividadService {
  async listByProceso(procesoId, filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      procesoId,
      deletedAt: null
    };

    if (filters.fase) where.fase = filters.fase;
    if (filters.estado) where.estado = filters.estado;
    if (filters.tipo) where.tipo = filters.tipo;

    // if (filters.responsableId) {
    //   where.asignaciones = {
    //     some: {
    //       usuarioId: filters.responsableId,
    //       rol: 'RESPONSABLE'
    //     }
    //   };
    // }

    if (filters.responsableId) {
      const actividadIds = await prisma.usuarioActividad.findMany({
        where: {
          usuarioId: filters.responsableId,
          rol: 'RESPONSABLE'
        },
        select: { actividadId: true }
      });

      where.id = {
        in: actividadIds.map(a => a.actividadId)
      };
    }

    // if (filters.responsableId) {
    //   where.id = {
    //     in: {
    //       select: { actividadId: true },
    //       from: prisma.usuarioActividad,
    //       where: {
    //         usuarioId: filters.responsableId,
    //         rol: 'RESPONSABLE'
    //       }
    //     }
    //   };
    // }

    const [actividades, total] = await Promise.all([
      prisma.actividadFase.findMany({
        where,
        skip,
        take,
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
        },
        orderBy: [
          { fase: 'asc' },
          { orden: 'asc' },
          { fechaInicio: 'asc' }
        ]
      }),
      prisma.actividadFase.count({ where })
    ]);

    const actividadesFormateadas = actividades.map(act => ({
      ...act,
      responsables: act.asignaciones
        .filter(a => a.rol === 'RESPONSABLE')
        .map(a => ({ ...a.usuario, rol: a.rol })),
      revisores: act.asignaciones
        .filter(a => a.rol === 'REVISOR')
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

async getById(id) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null },
      include: {
        proceso: {
          select: { codigo: true, titulo: true }
        },
        // 🔥 IMPORTANTE: Incluir requisitos para que el modal de subida funcione
        requisitos: true, 
        
        asignaciones: {
          include: {
            usuario: {
              select: { id: true, nombres: true, apellidos: true, email: true }
            }
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
        reunion: {
          include: { participantes: true }
        }
      }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad');
    }

    return {
      ...actividad,
      asignaciones: actividad.asignaciones.map(a => ({
        usuario: a.usuario,
        rol: a.rol,
        asignadoAt: a.asignadoAt
      }))
    };
  }

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

    // Preparar requisitos para Prisma
    // Si vienen requisitos desde el frontend, los mapeamos
    const requisitosCreate = data.requisitos?.map(req => ({
      nombre: req.nombre,
      descripcion: req.descripcion,
      obligatorio: req.obligatorio !== false // default true
    })) || [];

    // Crear la actividad con requisitos en una sola transacción
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
        
        // 🔥 AQUÍ SE CREAN LOS REQUISITOS
        requisitos: {
          create: requisitosCreate
        }
      },
      include: {
        requisitos: true // Devolverlos para confirmar
      }
    });

    // Asignaciones de usuarios (opcional, si el frontend las envía)
    if (data.responsables?.length > 0) {
      await this.assignMultipleUsuarios(actividad.id, data.responsables, 'RESPONSABLE');
    }
    if (data.revisores?.length > 0) {
      await this.assignMultipleUsuarios(actividad.id, data.revisores, 'REVISOR');
    }

    await this.updateProcesoCounters(procesoId);

    return actividad;
  }

  async update(id, data) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad');
    }

    if (actividad.estado === 'APROBADA') {
      throw new ValidationError('No se puede modificar una actividad aprobada');
    }

    return await prisma.actividadFase.update({
      where: { id },
      data
    });
  }

  async changeEstado(id, nuevoEstado, observaciones, userId) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null },
      include: {
        asignaciones: true
      }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad');
    }

    // 🔥 ACTUALIZAR transiciones válidas con LISTA_PARA_CIERRE
    const validTransitions = {
      'CREADA': ['EN_PROGRESO'],
      'EN_PROGRESO': ['EN_REVISION', 'OBSERVADA'],
      'EN_REVISION': ['LISTA_PARA_CIERRE', 'OBSERVADA'],  // Ya no APROBADA directamente
      'LISTA_PARA_CIERRE': ['OBSERVADA'],  // Solo se puede regresar a observada, aprobar es via endpoint dedicado
      'OBSERVADA': ['EN_PROGRESO', 'EN_REVISION'],
      'RECHAZADA': ['EN_PROGRESO'],
      'APROBADA': []
    };

    if (!validTransitions[actividad.estado].includes(nuevoEstado)) {
      throw new ValidationError(
        `No se puede cambiar de ${actividad.estado} a ${nuevoEstado}`
      );
    }

    const updateData = {
      estado: nuevoEstado,
      observaciones
    };

    // Solo APROBADA (via endpoint dedicado) actualiza fechaCierre
    // LISTA_PARA_CIERRE NO cierra la actividad
    if (nuevoEstado === 'APROBADA') {
      updateData.fechaCierre = new Date();
    }

    // Transacción
    const [updated] = await prisma.$transaction([
      prisma.actividadFase.update({
        where: { id },
        data: updateData
      }),
      // Registrar en historial
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

  async delete(id) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null },
      include: {
        evidencias: {
          where: { estado: 'PENDIENTE', deletedAt: null }
        }
      }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad');
    }

    if (actividad.evidencias.length > 0) {
      throw new ValidationError('No se puede eliminar una actividad con evidencias pendientes');
    }

    const deleted = await prisma.actividadFase.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await this.updateProcesoCounters(actividad.procesoId);

    return deleted;
  }

  async assignUsuario(actividadId, usuarioId, rol) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id: actividadId, deletedAt: null },
      include: {
        asignaciones: true
      }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad');
    }

    if (rol === 'REVISOR') {
      const isResponsable = actividad.asignaciones.some(
        a => a.usuarioId === usuarioId && a.rol === 'RESPONSABLE'
      );
      if (isResponsable) {
        throw new ValidationError('Un usuario no puede ser RESPONSABLE y REVISOR de la misma actividad');
      }
    }

    const existing = await prisma.usuarioActividad.findFirst({
      where: { actividadId, usuarioId, rol }
    });

    if (existing) {
      throw new ValidationError('El usuario ya tiene este rol en la actividad');
    }

    return await prisma.usuarioActividad.create({
      data: { actividadId, usuarioId, rol }
    });
  }

  async removeUsuario(actividadId, usuarioId) {
    await prisma.usuarioActividad.deleteMany({
      where: { actividadId, usuarioId }
    });
  }

  async assignMultipleUsuarios(actividadId, usuarioIds, rol) {
    const asignaciones = usuarioIds.map(usuarioId => ({
      actividadId,
      usuarioId,
      rol
    }));

    await prisma.usuarioActividad.createMany({
      data: asignaciones,
      skipDuplicates: true
    });
  }

  async getNextOrden(procesoId, fase) {
    const maxOrden = await prisma.actividadFase.findFirst({
      where: { procesoId, fase, deletedAt: null },
      orderBy: { orden: 'desc' },
      select: { orden: true }
    });

    return (maxOrden?.orden || 0) + 1;
  }

  // async updateProcesoCounters(procesoId) {
  //   const [total, completadas, pendientes, observadas] = await Promise.all([
  //     prisma.actividadFase.count({
  //       where: { procesoId, deletedAt: null }
  //     }),
  //     prisma.actividadFase.count({
  //       where: { procesoId, estado: 'APROBADA', deletedAt: null }
  //     }),
  //     prisma.actividadFase.count({
  //       where: {
  //         procesoId,
  //         estado: { in: ['CREADA', 'EN_PROGRESO', 'EN_REVISION'] },
  //         deletedAt: null
  //       }
  //     }),
  //     prisma.actividadFase.count({
  //       where: {
  //         procesoId,
  //         estado: { in: ['OBSERVADA', 'RECHAZADA'] },
  //         deletedAt: null
  //       }
  //     })
  //   ]);

  //   await prisma.procesoVinculacion.update({
  //     where: { id: procesoId },
  //     data: {
  //       actividadesTotales: total,
  //       actividadesCompletadas: completadas,
  //       actividadesPendientes: pendientes,
  //       actividadesObservadas: observadas
  //     }
  //   });
  // }

  async updateProcesoCounters(procesoId) {
    await procesoService.updateStats(procesoId);
  }

  async aprobar(id, userId) {
    const actividad = await prisma.actividadFase.findFirst({
      where: { id, deletedAt: null },
      include: {
        evidencias: {
          where: { deletedAt: null }
        }
      }
    });

    if (!actividad) {
      throw new NotFoundError('Actividad');
    }

    // Solo se puede aprobar desde LISTA_PARA_CIERRE
    if (actividad.estado !== 'LISTA_PARA_CIERRE') {
      throw new ValidationError(
        `Solo se pueden aprobar actividades en estado LISTA_PARA_CIERRE (actual: ${actividad.estado})`
      );
    }

    // Validar que todas las evidencias estén aprobadas
    const evidenciasPendientes = actividad.evidencias.filter(
      e => e.estado !== 'APROBADA'
    );

    if (evidenciasPendientes.length > 0) {
      throw new ValidationError(
        `Existen ${evidenciasPendientes.length} evidencia(s) sin aprobar`
      );
    }

    // Transacción: actualizar actividad y registrar historial
    const [updated] = await prisma.$transaction([
      // Aprobar actividad
      prisma.actividadFase.update({
        where: { id },
        data: {
          estado: 'APROBADA',
          fechaCierre: new Date()
        }
      }),
      // Registrar en historial
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

    // Actualizar contadores del proceso
    await this.updateProcesoCounters(actividad.procesoId);

    return updated;
  }

  /**
   * 🧠 MÁQUINA DE ESTADOS AUTOMÁTICA
   * Evalúa el estado de la actividad basándose EXCLUSIVAMENTE en sus evidencias.
   */
  async recalculateState(actividadId) {
    const actividad = await prisma.actividadFase.findUnique({
      where: { id: actividadId },
      include: {
        requisitos: true,
        evidencias: {
          where: { deletedAt: null },
          orderBy: { version: 'desc' } // Importante para tomar la última
        },
        asignaciones: true
      }
    });

    if (!actividad) return;
    if (actividad.estado === 'APROBADA') return; // Estado final inmutable salvo admin

    // 1. Mapear estado de la ÚLTIMA versión de cada requisito
    const estadoPorRequisito = new Map(); // requisitoId -> estado
    const estadoEvidenciasExtra = []; // Evidencias sin requisito

    for (const ev of actividad.evidencias) {
      if (ev.requisitoId) {
        // Solo guardamos la primera que encontramos (que es la última versión por el orderBy desc)
        if (!estadoPorRequisito.has(ev.requisitoId)) {
          estadoPorRequisito.set(ev.requisitoId, ev.estado);
        }
      } else {
        // Si no tiene requisito, se evalúa individualmente
        estadoEvidenciasExtra.push(ev.estado);
      }
    }

    // 2. Analizar el conjunto
    const estadosRelevantes = [
      ...Array.from(estadoPorRequisito.values()),
      ...estadoEvidenciasExtra
    ];

    const hayRechazadas = estadosRelevantes.includes('RECHAZADA');
    const hayPendientes = estadosRelevantes.includes('PENDIENTE');
    const hayAprobadas = estadosRelevantes.includes('APROBADA');

    // 3. Validar completitud (¿Faltan requisitos obligatorios por subir?)
    const requisitosObligatorios = actividad.requisitos.filter(r => r.obligatorio);
    const estanTodosLosObligatorios = requisitosObligatorios.every(req => {
      // El requisito existe en el mapa (se subió algo)
      return estadoPorRequisito.has(req.id);
    });
    
    // Validar aprobación total (¿Están todos aprobados?)
    const estanTodosAprobados = requisitosObligatorios.every(req => {
        return estadoPorRequisito.get(req.id) === 'APROBADA';
    });

    let nuevoEstado = actividad.estado;

    // 4. Lógica de Transición (Tu especificación)
    if (hayRechazadas) {
      // "Si el revisor rechaza... pasa a OBSERVADA"
      nuevoEstado = 'OBSERVADA';
    } else if (hayPendientes) {
      // "Si existe contenido por revisar... pasa a EN_REVISION"
      // Verificar si hay revisor asignado
      const hayRevisor = actividad.asignaciones.some(a => a.rol === 'REVISOR');
      nuevoEstado = hayRevisor ? 'EN_REVISION' : 'EN_PROGRESO';
    } else {
      // No hay rechazadas ni pendientes
      if (estanTodosAprobados && !hayPendientes && !hayRechazadas) {
        // "Si todas las evidencias... están aprobadas... pasa a LISTA_PARA_CIERRE"
        nuevoEstado = 'LISTA_PARA_CIERRE';
      } else if (hayAprobadas || estadosRelevantes.length > 0) {
        // Hay cosas aprobadas pero faltan obligatorios por subir -> Sigue trabajando
        nuevoEstado = 'EN_PROGRESO';
      } else {
        // No hay evidencias (o se borraron todas).
        // Si ya se había movido de CREADA, regresamos a EN_PROGRESO o CREADA según prefieras.
        if (nuevoEstado !== 'CREADA') nuevoEstado = 'EN_PROGRESO';
      }
    }

    // 5. Aplicar cambio si es diferente
    if (nuevoEstado !== actividad.estado) {
      console.log(`⚡ Cambio de estado automático: ${actividad.estado} -> ${nuevoEstado}`);
      
      await prisma.actividadFase.update({
        where: { id: actividadId },
        data: { estado: nuevoEstado }
      });

      // Registrar en historial si lo deseas (opcional para no saturar)
      /* await prisma.historialActividad.create({ ... });
      */
    }
  }
}

export default new ActividadService();