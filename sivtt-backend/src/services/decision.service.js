import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import convocatoriaService from './convocatoria.service.js';

class DecisionService {
  async listByProceso(procesoId, filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      procesoId,
    };

    if (filters.fase) where.fase = filters.fase;
    if (filters.decision) where.decision = filters.decision;

    const [decisiones, total] = await Promise.all([
      prisma.decisionFase.findMany({
        where,
        skip,
        take,
        include: {
          decididor: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true
            }
          },
          faseProceso: {
            select: {
              fase: true,
              estado: true
            }
          }
        },
        orderBy: { fecha: 'desc' }
      }),
      prisma.decisionFase.count({ where })
    ]);

    return buildPaginatedResponse(decisiones, total, page, limit);
  }

  async create(procesoId, faseId, data, userId, extraData = {}) {
    const [proceso, fase] = await Promise.all([
      prisma.procesoVinculacion.findFirst({
        where: { id: procesoId, deletedAt: null }
      }),
      prisma.faseProceso.findFirst({
        where: { id: faseId, deletedAt: null }
      })
    ]);

    if (!proceso) throw new NotFoundError('Proceso');
    if (!fase) throw new NotFoundError('Fase');

    if (data.decision === 'CONTINUAR') {
      return await this.handleContinuar(proceso, fase, data.justificacion, userId);
    } else if (data.decision === 'RETROCEDER') {
      return await this.handleRetroceder(proceso, fase, data.faseDestino, data.justificacion, userId);
    } else if (data.decision === 'PAUSAR') {
      return await this.handlePausar(proceso, fase, data.justificacion, userId);
    } else if (data.decision === 'CANCELAR') {
      return await this.handleCancelar(proceso, fase, data.justificacion, userId);
    } else if (data.decision === 'FINALIZAR') {
      return await this.handleFinalizar(proceso, fase, data.justificacion, userId);
    } else if (data.decision === 'RELANZAR_CONVOCATORIA') {
      return await this.handleRelanzarConvocatoria(proceso, fase, data.justificacion, userId, extraData);
    }
  }

  async handleContinuar(proceso, fase, justificacion, userId) {
    const actividadesPendientes = await prisma.actividadFase.count({
      where: {
        faseProcesoId: fase.id,
        obligatoria: true,
        estado: { not: 'APROBADA' },
        deletedAt: null
      }
    });

    if (actividadesPendientes > 0) {
      throw new ValidationError('Existen actividades obligatorias pendientes');
    }

    const siguienteFase = this.getSiguienteFase(proceso.tipoActivo, fase.fase);

    if (!siguienteFase) {
      throw new ValidationError('No hay siguiente fase. Use FINALIZAR');
    }

    const decision = await prisma.decisionFase.create({
      data: {
        procesoId: proceso.id,
        faseId: fase.id,
        fase: fase.fase,
        decision: 'CONTINUAR',
        justificacion,
        decididorId: userId
      }
    });

    await prisma.faseProceso.update({
      where: { id: fase.id },
      data: {
        estado: 'CERRADA',
        fechaFin: new Date()
      }
    });

    const nuevaFase = await prisma.faseProceso.create({
      data: {
        procesoId: proceso.id,
        fase: siguienteFase,
        estado: 'ABIERTA'
      }
    });

    await prisma.procesoVinculacion.update({
      where: { id: proceso.id },
      data: { faseActual: siguienteFase }
    });

    await prisma.historialFaseProceso.create({
      data: {
        procesoId: proceso.id,
        faseAnterior: fase.fase,
        faseNueva: siguienteFase,
        motivo: `Decisión: CONTINUAR - ${justificacion}`,
        modificadoPor: userId
      }
    });

    return decision;
  }

  async handleRetroceder(proceso, fase, faseDestino, justificacion, userId) {
    if (!faseDestino) {
      throw new ValidationError('Debe especificar la fase destino');
    }

    const faseDestinoObj = await prisma.faseProceso.findFirst({
      where: {
        procesoId: proceso.id,
        fase: faseDestino,
        deletedAt: null
      }
    });

    if (!faseDestinoObj) {
      throw new NotFoundError('Fase destino');
    }

    const decision = await prisma.decisionFase.create({
      data: {
        procesoId: proceso.id,
        faseId: fase.id,
        fase: fase.fase,
        decision: 'RETROCEDER',
        justificacion,
        decididorId: userId
      }
    });

    await prisma.faseProceso.update({
      where: { id: fase.id },
      data: {
        estado: 'CERRADA',
        fechaFin: new Date()
      }
    });

    await prisma.faseProceso.update({
      where: { id: faseDestinoObj.id },
      data: {
        estado: 'ABIERTA',
        fechaFin: null
      }
    });

    await prisma.procesoVinculacion.update({
      where: { id: proceso.id },
      data: { faseActual: faseDestino }
    });

    await prisma.historialFaseProceso.create({
      data: {
        procesoId: proceso.id,
        faseAnterior: fase.fase,
        faseNueva: faseDestino,
        motivo: `Decisión: RETROCEDER - ${justificacion}`,
        modificadoPor: userId
      }
    });

    return decision;
  }

  async handlePausar(proceso, fase, justificacion, userId) {
    const decision = await prisma.decisionFase.create({
      data: {
        procesoId: proceso.id,
        faseId: fase.id,
        fase: fase.fase,
        decision: 'PAUSAR',
        justificacion,
        decididorId: userId
      }
    });

    await prisma.procesoVinculacion.update({
      where: { id: proceso.id },
      data: { estado: 'PAUSADO' }
    });

    await prisma.historialEstadoProceso.create({
      data: {
        procesoId: proceso.id,
        estadoAnterior: proceso.estado,
        estadoNuevo: 'PAUSADO',
        motivo: justificacion,
        modificadoPor: userId
      }
    });

    return decision;
  }

  async handleCancelar(proceso, fase, justificacion, userId) {
    const decision = await prisma.decisionFase.create({
      data: {
        procesoId: proceso.id,
        faseId: fase.id,
        fase: fase.fase,
        decision: 'CANCELAR',
        justificacion,
        decididorId: userId
      }
    });

    await prisma.procesoVinculacion.update({
      where: { id: proceso.id },
      data: { estado: 'CANCELADO' }
    });

    await prisma.historialEstadoProceso.create({
      data: {
        procesoId: proceso.id,
        estadoAnterior: proceso.estado,
        estadoNuevo: 'CANCELADO',
        motivo: justificacion,
        modificadoPor: userId
      }
    });

    return decision;
  }

  async handleFinalizar(proceso, fase, justificacion, userId) {
    const fasesFinal = proceso.tipoActivo === 'PATENTE' ? 'TRANSFERENCIA' : 'CIERRE';

    if (fase.fase !== fasesFinal) {
      throw new ValidationError(`Solo se puede finalizar en fase ${fasesFinal}`);
    }

    const actividadesPendientes = await prisma.actividadFase.count({
      where: {
        faseProcesoId: fase.id,
        obligatoria: true,
        estado: { not: 'APROBADA' },
        deletedAt: null
      }
    });

    if (actividadesPendientes > 0) {
      throw new ValidationError('Existen actividades obligatorias pendientes');
    }

    const decision = await prisma.decisionFase.create({
      data: {
        procesoId: proceso.id,
        faseId: fase.id,
        fase: fase.fase,
        decision: 'FINALIZAR',
        justificacion,
        decididorId: userId
      }
    });

    await prisma.faseProceso.update({
      where: { id: fase.id },
      data: {
        estado: 'CERRADA',
        fechaFin: new Date()
      }
    });

    await prisma.procesoVinculacion.update({
      where: { id: proceso.id },
      data: { estado: 'FINALIZADO' }
    });

    await prisma.historialEstadoProceso.create({
      data: {
        procesoId: proceso.id,
        estadoAnterior: proceso.estado,
        estadoNuevo: 'FINALIZADO',
        motivo: justificacion,
        modificadoPor: userId
      }
    });

    return decision;
  }

  // async handleRelanzarConvocatoria(proceso, fase, justificacion, userId) {
  //   if (proceso.tipoActivo !== 'REQUERIMIENTO_EMPRESARIAL') {
  //     throw new ValidationError('Solo aplica para requerimientos empresariales');
  //   }

  //   if (fase.fase !== 'SELECCION') {
  //     throw new ValidationError('Solo se puede relanzar en fase SELECCION');
  //   }

  //   const decision = await prisma.decisionFase.create({
  //     data: {
  //       procesoId: proceso.id,
  //       faseId: fase.id,
  //       fase: fase.fase,
  //       decision: 'RELANZAR_CONVOCATORIA',
  //       justificacion,
  //       decididorId: userId
  //     }
  //   });

  //   await prisma.faseProceso.update({
  //     where: { id: fase.id },
  //     data: {
  //       estado: 'CERRADA',
  //       fechaFin: new Date()
  //     }
  //   });

  //   const faseConvocatoria = await prisma.faseProceso.findFirst({
  //     where: {
  //       procesoId: proceso.id,
  //       fase: 'CONVOCATORIA',
  //       deletedAt: null
  //     }
  //   });

  //   if (faseConvocatoria) {
  //     await prisma.faseProceso.update({
  //       where: { id: faseConvocatoria.id },
  //       data: {
  //         estado: 'ABIERTA',
  //         fechaFin: null
  //       }
  //     });
  //   }

  //   await prisma.procesoVinculacion.update({
  //     where: { id: proceso.id },
  //     data: { faseActual: 'CONVOCATORIA' }
  //   });

  //   await prisma.historialFaseProceso.create({
  //     data: {
  //       procesoId: proceso.id,
  //       faseAnterior: 'SELECCION',
  //       faseNueva: 'CONVOCATORIA',
  //       motivo: `Decisión: RELANZAR_CONVOCATORIA - ${justificacion}`,
  //       modificadoPor: userId
  //     }
  //   });

  //   return decision;
  // }

  async handleRelanzarConvocatoria(proceso, fase, justificacion, userId, dataRelanzamiento) {
    if (proceso.tipoActivo !== 'REQUERIMIENTO_EMPRESARIAL') {
      throw new ValidationError('Solo aplica para requerimientos empresariales');
    }

    if (fase.fase !== 'SELECCION') {
      throw new ValidationError('Solo se puede relanzar en fase SELECCION');
    }

    // Obtener reto del proceso
    const reto = await prisma.retoTecnologico.findFirst({
      where: { procesoId: proceso.id, deletedAt: null }
    });

    if (!reto) {
      throw new ValidationError('El proceso no tiene un reto tecnológico asociado');
    }

    // Obtener convocatoria actual (la más reciente cerrada)
    const convocatoriaActual = await prisma.convocatoria.findFirst({
      where: {
        retoId: reto.id,
        estatus: 'CERRADA',
        deletedAt: null
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!convocatoriaActual) {
      throw new ValidationError('No se encontró convocatoria cerrada para relanzar');
    }

    // 🔥 DELEGAR creación de nueva convocatoria a ConvocatoriaService
    const nuevaConvocatoria = await convocatoriaService.relanzar(
      convocatoriaActual.id,
      {
        motivoRelanzamiento: justificacion,
        fechaApertura: dataRelanzamiento?.fechaApertura,
        fechaCierre: dataRelanzamiento?.fechaCierre,
        modificaciones: dataRelanzamiento?.modificaciones
      }
    );

    // Registrar decisión
    const decision = await prisma.decisionFase.create({
      data: {
        procesoId: proceso.id,
        faseId: fase.id,
        fase: fase.fase,
        decision: 'RELANZAR_CONVOCATORIA',
        justificacion,
        decididorId: userId
      }
    });

    // Cerrar fase actual (SELECCION)
    await prisma.faseProceso.update({
      where: { id: fase.id },
      data: {
        estado: 'CERRADA',
        fechaFin: new Date()
      }
    });

    // Buscar o crear fase CONVOCATORIA
    let faseConvocatoria = await prisma.faseProceso.findFirst({
      where: {
        procesoId: proceso.id,
        fase: 'CONVOCATORIA',
        deletedAt: null
      }
    });

    if (faseConvocatoria) {
      // Reabrir fase existente
      await prisma.faseProceso.update({
        where: { id: faseConvocatoria.id },
        data: {
          estado: 'ABIERTA',
          fechaFin: null
        }
      });
    } else {
      // Crear nueva fase (caso raro, pero posible)
      faseConvocatoria = await prisma.faseProceso.create({
        data: {
          procesoId: proceso.id,
          fase: 'CONVOCATORIA',
          estado: 'ABIERTA'
        }
      });
    }

    // Actualizar proceso
    await prisma.procesoVinculacion.update({
      where: { id: proceso.id },
      data: { faseActual: 'CONVOCATORIA' }
    });

    // Registrar historial
    await prisma.historialFaseProceso.create({
      data: {
        procesoId: proceso.id,
        faseAnterior: 'SELECCION',
        faseNueva: 'CONVOCATORIA',
        motivo: `Decisión: RELANZAR_CONVOCATORIA - ${justificacion}`,
        modificadoPor: userId
      }
    });

    return decision;
  }

  getSiguienteFase(tipoActivo, faseActual) {
    const flujos = {
      PATENTE: {
        CARACTERIZACION: 'ENRIQUECIMIENTO',
        ENRIQUECIMIENTO: 'MATCH',
        MATCH: 'ESCALAMIENTO',
        ESCALAMIENTO: 'TRANSFERENCIA',
        TRANSFERENCIA: null
      },
      REQUERIMIENTO_EMPRESARIAL: {
        FORMULACION_RETO: 'CONVOCATORIA',
        CONVOCATORIA: 'POSTULACION',
        POSTULACION: 'SELECCION',
        SELECCION: 'ANTEPROYECTO',
        ANTEPROYECTO: 'EJECUCION',
        EJECUCION: 'CIERRE',
        CIERRE: null
      }
    };

    return flujos[tipoActivo][faseActual];
  }
}

export default new DecisionService();