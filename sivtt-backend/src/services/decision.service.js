import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import convocatoriaService from './convocatoria.service.js';

class DecisionService {

  async listByProceso(procesoId, filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);
    const where = { procesoId };

    if (filters.fase) where.fase = filters.fase;
    if (filters.decision) where.decision = filters.decision;

    const [decisiones, total] = await Promise.all([
      prisma.decisionFase.findMany({
        where,
        skip,
        take,
        include: {
          decididor: { select: { id: true, nombres: true, apellidos: true, email: true } },
          faseProceso: { select: { fase: true, estado: true } }
        },
        orderBy: { fecha: 'desc' }
      }),
      prisma.decisionFase.count({ where })
    ]);

    return buildPaginatedResponse(decisiones, total, page, limit);
  }

  async create(procesoId, faseId, data, userId) {
    const [proceso, fase] = await Promise.all([
      prisma.procesoVinculacion.findFirst({ where: { id: procesoId, deletedAt: null } }),
      prisma.faseProceso.findFirst({ where: { id: faseId, deletedAt: null } })
    ]);

    if (!proceso) throw new NotFoundError('Proceso');
    if (!fase) throw new NotFoundError('Fase');

    switch (data.decision) {
      case 'CONTINUAR':
        return this.handleContinuar(proceso, fase, data.justificacion, userId);
      case 'RETROCEDER':
        return this.handleRetroceder(proceso, fase, data.faseDestino, data.justificacion, userId);
      case 'PAUSAR':
        return this.handlePausar(proceso, fase, data.justificacion, userId);
      case 'CANCELAR':
        return this.handleCancelar(proceso, fase, data.justificacion, userId);
      case 'FINALIZAR':
        return this.handleFinalizar(proceso, fase, data.justificacion, userId);
      case 'RELANZAR_CONVOCATORIA':
        return this.handleRelanzarConvocatoria(proceso, fase, data, userId);
      default:
        throw new ValidationError('Tipo de decisión no válido');
    }
  }

  // ==========================================
  // ⏩ CONTINUAR (Avanzar Normal)
  // ==========================================
  async handleContinuar(proceso, fase, justificacion, userId) {
    await this.validateActividadesPendientes(fase.id);

    const siguienteFase = this.getSiguienteFase(proceso.tipoActivo, fase.fase);
    if (!siguienteFase) throw new ValidationError('No hay siguiente fase. Use FINALIZAR');

    return await prisma.$transaction(async (tx) => {
      // 1. Registrar Decisión
      const decision = await tx.decisionFase.create({
        data: {
          procesoId: proceso.id,
          faseId: fase.id,
          fase: fase.fase,
          decision: 'CONTINUAR',
          justificacion,
          decididorId: userId
        }
      });

      // 2. Cerrar Fase Actual
      await tx.faseProceso.update({
        where: { id: fase.id },
        data: { estado: 'CERRADA', fechaFin: new Date() }
      });

      // 3. Crear Siguiente Fase
      await tx.faseProceso.create({
        data: {
          procesoId: proceso.id,
          fase: siguienteFase,
          estado: 'ABIERTA',
          fechaInicio: new Date(),
          responsableId: fase.responsableId // Heredamos responsable
        }
      });

      // 4. Actualizar Puntero
      await tx.procesoVinculacion.update({
        where: { id: proceso.id },
        data: { faseActual: siguienteFase }
      });

      // 5. Historial
      await tx.historialFaseProceso.create({
        data: {
          procesoId: proceso.id,
          faseAnterior: fase.fase,
          faseNueva: siguienteFase,
          motivo: `Decisión: CONTINUAR - ${justificacion}`,
          modificadoPor: userId
        }
      });

      return decision;
    });
  }

  // ==========================================
  // ⏪ RETROCEDER (El Deep Clone)
  // ==========================================
  async handleRetroceder(proceso, faseActual, faseDestino, justificacion, userId) {
    if (!faseDestino) throw new ValidationError('Debe especificar la fase destino');

    // Validar orden lógico
    const ordenFases = this.getOrdenFases(proceso.tipoActivo);
    const indiceActual = ordenFases.indexOf(faseActual.fase);
    const indiceDestino = ordenFases.indexOf(faseDestino);

    if (indiceDestino === -1) throw new ValidationError(`Fase destino inválida para ${proceso.tipoActivo}`);
    if (indiceDestino >= indiceActual) throw new ValidationError('No se puede retroceder a una fase futura o igual');

    return await prisma.$transaction(async (tx) => {
      // 1. Registrar Decisión
      const decision = await tx.decisionFase.create({
        data: {
          procesoId: proceso.id,
          faseId: faseActual.id,
          fase: faseActual.fase,
          decision: 'RETROCEDER',
          justificacion,
          decididorId: userId
        }
      });

      // 2. Cerrar Fase Actual (Abandonada)
      await tx.faseProceso.update({
        where: { id: faseActual.id },
        data: { estado: 'CERRADA', fechaFin: new Date(), observaciones: `Retroceso a ${faseDestino}` }
      });

      // 3. Buscar la "Plantilla" (Última vez que estuvimos en destino)
      const fasePlantilla = await tx.faseProceso.findFirst({
        where: { procesoId: proceso.id, fase: faseDestino },
        orderBy: { createdAt: 'desc' },
        include: {
          actividades: {
            where: { deletedAt: null },
            include: { requisitos: { where: { deletedAt: null } } } // 🔥 Importante: Traer requisitos
          }
        }
      });

      // 4. Crear NUEVA Fase Destino (Limpia)
      const nuevaFase = await tx.faseProceso.create({
        data: {
          procesoId: proceso.id,
          fase: faseDestino,
          estado: 'ABIERTA',
          fechaInicio: new Date(),
          responsableId: faseActual.responsableId
        }
      });

      // 5. 🔥 CLONAR ESTRUCTURA (Actividades + Requisitos)
      if (fasePlantilla && fasePlantilla.actividades.length > 0) {
        for (const actividad of fasePlantilla.actividades) {
          // Crear actividad limpia
          await tx.actividadFase.create({
            data: {
              procesoId: proceso.id,
              fase: faseDestino,
              faseProcesoId: nuevaFase.id, // Vinculamos a la nueva fase
              tipo: actividad.tipo,
              nombre: actividad.nombre,
              descripcion: actividad.descripcion,
              obligatoria: actividad.obligatoria,
              orden: actividad.orden,
              estado: 'CREADA', // Reset estado
              fechaInicio: new Date(),
              // Clonamos también los requisitos hijos
              requisitos: {
                create: actividad.requisitos.map(req => ({
                  nombre: req.nombre,
                  descripcion: req.descripcion,
                  obligatorio: req.obligatorio,
                  formato: req.formato
                }))
              }
            }
          });
        }
      }

      // 6. Actualizar Proceso
      await tx.procesoVinculacion.update({
        where: { id: proceso.id },
        data: { faseActual: faseDestino }
      });

      // 7. Historial
      await tx.historialFaseProceso.create({
        data: {
          procesoId: proceso.id,
          faseAnterior: faseActual.fase,
          faseNueva: faseDestino,
          motivo: `Decisión: RETROCEDER - ${justificacion}`,
          modificadoPor: userId
        }
      });

      return decision;
    });
  }

  // ==========================================
  // 🔄 RELANZAR (Deep Clone Específico)
  // ==========================================
  async handleRelanzarConvocatoria(proceso, fase, data, userId) {
    if (proceso.tipoActivo !== 'REQUERIMIENTO_EMPRESARIAL') throw new ValidationError('Solo aplica para requerimientos');
    if (fase.fase !== 'SELECCION') throw new ValidationError('Solo en fase SELECCION');

    // Buscar la última fase CONVOCATORIA para usar de plantilla
    const fasePlantilla = await prisma.faseProceso.findFirst({
        where: { procesoId: proceso.id, fase: 'CONVOCATORIA' },
        orderBy: { createdAt: 'desc' },
        include: { actividades: { include: { requisitos: true } } }
    });

    // Lógica de negocio externa (Convocatorias)
    // Aquí asumimos que ya tienes la lógica de buscar convocatoria cerrada
    // ...

    return await prisma.$transaction(async (tx) => {
      // 1. Decisión
      const decision = await tx.decisionFase.create({
        data: {
          procesoId: proceso.id,
          faseId: fase.id,
          fase: fase.fase,
          decision: 'RELANZAR_CONVOCATORIA',
          justificacion: data.justificacion,
          decididorId: userId
        }
      });

      // 2. Cerrar Selección
      await tx.faseProceso.update({
        where: { id: fase.id },
        data: { estado: 'CERRADA', fechaFin: new Date() }
      });

      // 3. Crear Nueva Fase Convocatoria
      const nuevaFase = await tx.faseProceso.create({
        data: {
          procesoId: proceso.id,
          fase: 'CONVOCATORIA',
          estado: 'ABIERTA',
          fechaInicio: new Date(),
          responsableId: fase.responsableId
        }
      });

      // 4. Clonar actividades si existen
      if (fasePlantilla && fasePlantilla.actividades.length > 0) {
        for (const actividad of fasePlantilla.actividades) {
          await tx.actividadFase.create({
            data: {
              procesoId: proceso.id,
              fase: 'CONVOCATORIA',
              faseProcesoId: nuevaFase.id,
              tipo: actividad.tipo,
              nombre: actividad.nombre,
              descripcion: actividad.descripcion,
              obligatoria: actividad.obligatoria,
              orden: actividad.orden,
              estado: 'CREADA',
              fechaInicio: new Date(),
              requisitos: {
                create: actividad.requisitos.map(req => ({
                  nombre: req.nombre,
                  descripcion: req.descripcion,
                  obligatorio: req.obligatorio
                }))
              }
            }
          });
        }
      }

      // 5. Update Proceso
      await tx.procesoVinculacion.update({
        where: { id: proceso.id },
        data: { faseActual: 'CONVOCATORIA' }
      });

      // 6. Historial
      await tx.historialFaseProceso.create({
        data: {
          procesoId: proceso.id,
          faseAnterior: 'SELECCION',
          faseNueva: 'CONVOCATORIA',
          motivo: `Relanzamiento: ${data.justificacion}`,
          modificadoPor: userId
        }
      });

      return decision;
    });
  }

  // ... handlePausar, handleCancelar, handleFinalizar (Se mantienen igual que antes) ...
  async handlePausar(proceso, fase, justificacion, userId) {
    return await prisma.$transaction(async (tx) => {
        const decision = await tx.decisionFase.create({
            data: { procesoId: proceso.id, faseId: fase.id, fase: fase.fase, decision: 'PAUSAR', justificacion, decididorId: userId }
        });
        await tx.procesoVinculacion.update({ where: { id: proceso.id }, data: { estado: 'PAUSADO' } });
        await tx.historialEstadoProceso.create({
            data: { procesoId: proceso.id, estadoAnterior: proceso.estado, estadoNuevo: 'PAUSADO', motivo: justificacion, modificadoPor: userId }
        });
        return decision;
    });
  }

  async handleCancelar(proceso, fase, justificacion, userId) {
    return await prisma.$transaction(async (tx) => {
        const decision = await tx.decisionFase.create({
            data: { procesoId: proceso.id, faseId: fase.id, fase: fase.fase, decision: 'CANCELAR', justificacion, decididorId: userId }
        });
        await tx.procesoVinculacion.update({ where: { id: proceso.id }, data: { estado: 'CANCELADO' } });
        await tx.faseProceso.update({ where: { id: fase.id }, data: { estado: 'CERRADA', fechaFin: new Date() } }); // Cerrar fase actual también
        await tx.historialEstadoProceso.create({
            data: { procesoId: proceso.id, estadoAnterior: proceso.estado, estadoNuevo: 'CANCELADO', motivo: justificacion, modificadoPor: userId }
        });
        return decision;
    });
  }

  async handleFinalizar(proceso, fase, justificacion, userId) {
    const fasesFinal = proceso.tipoActivo === 'PATENTE' ? 'TRANSFERENCIA' : 'CIERRE';
    if (fase.fase !== fasesFinal) throw new ValidationError(`Solo se puede finalizar en fase ${fasesFinal}`);
    await this.validateActividadesPendientes(fase.id);

    return await prisma.$transaction(async (tx) => {
        const decision = await tx.decisionFase.create({
            data: { procesoId: proceso.id, faseId: fase.id, fase: fase.fase, decision: 'FINALIZAR', justificacion, decididorId: userId }
        });
        await tx.faseProceso.update({ where: { id: fase.id }, data: { estado: 'CERRADA', fechaFin: new Date() } });
        await tx.procesoVinculacion.update({ where: { id: proceso.id }, data: { estado: 'FINALIZADO' } });
        await tx.historialEstadoProceso.create({
            data: { procesoId: proceso.id, estadoAnterior: proceso.estado, estadoNuevo: 'FINALIZADO', motivo: justificacion, modificadoPor: userId }
        });
        return decision;
    });
  }

  // Helpers
  async validateActividadesPendientes(faseProcesoId) {
    const pendientes = await prisma.actividadFase.count({
      where: {
        faseProcesoId,
        obligatoria: true,
        estado: { not: 'APROBADA' },
        deletedAt: null
      }
    });
    if (pendientes > 0) throw new ValidationError('Existen actividades obligatorias pendientes');
  }

  getSiguienteFase(tipoActivo, faseActual) {
    const flujos = {
      PATENTE: { CARACTERIZACION: 'ENRIQUECIMIENTO', ENRIQUECIMIENTO: 'MATCH', MATCH: 'ESCALAMIENTO', ESCALAMIENTO: 'TRANSFERENCIA', TRANSFERENCIA: null },
      REQUERIMIENTO_EMPRESARIAL: { FORMULACION_RETO: 'CONVOCATORIA', CONVOCATORIA: 'POSTULACION', POSTULACION: 'SELECCION', SELECCION: 'ANTEPROYECTO', ANTEPROYECTO: 'EJECUCION', EJECUCION: 'CIERRE', CIERRE: null }
    };
    return flujos[tipoActivo][faseActual];
  }

  getOrdenFases(tipoActivo) {
    const flujos = {
      PATENTE: ['CARACTERIZACION', 'ENRIQUECIMIENTO', 'MATCH', 'ESCALAMIENTO', 'TRANSFERENCIA'],
      REQUERIMIENTO_EMPRESARIAL: ['FORMULACION_RETO', 'CONVOCATORIA', 'POSTULACION', 'SELECCION', 'ANTEPROYECTO', 'EJECUCION', 'CIERRE']
    };
    return flujos[tipoActivo] || [];
  }
}

export default new DecisionService();