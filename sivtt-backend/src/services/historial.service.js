import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';
import { getPagination } from '../utils/pagination.js';

class HistorialService {
  async getHistorialCompleto(procesoId, filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    // ✅ Construir where clauses con filtros aplicados en BD
    const baseWhere = { procesoId };

    // Filtro de fecha
    if (filters.fecha_desde || filters.fecha_hasta) {
      baseWhere.fecha = {};
      if (filters.fecha_desde) {
        baseWhere.fecha.gte = new Date(filters.fecha_desde);
      }
      if (filters.fecha_hasta) {
        baseWhere.fecha.lte = new Date(filters.fecha_hasta);
      }
    }

    // Filtro de usuario
    if (filters.usuarioId) {
      baseWhere.modificadoPor = parseInt(filters.usuarioId);
    }

    // ✅ Queries paralelas solo para tipos solicitados
    const queries = [];
    const tipos = [];

    if (!filters.tipo || filters.tipo === 'TRL' || filters.tipo === 'ALL') {
      tipos.push('TRL');
      queries.push(
        prisma.historialTRL.findMany({
          where: baseWhere,
          include: {
            usuario: {
              select: { id: true, nombres: true, apellidos: true }
            }
          },
          orderBy: { fecha: 'desc' }
        })
      );
    } else {
      queries.push(Promise.resolve([]));
    }

    if (!filters.tipo || filters.tipo === 'ESTADO' || filters.tipo === 'ALL') {
      tipos.push('ESTADO');
      queries.push(
        prisma.historialEstadoProceso.findMany({
          where: baseWhere,
          include: {
            usuario: {
              select: { id: true, nombres: true, apellidos: true }
            }
          },
          orderBy: { fecha: 'desc' }
        })
      );
    } else {
      queries.push(Promise.resolve([]));
    }

    if (!filters.tipo || filters.tipo === 'FASE' || filters.tipo === 'ALL') {
      tipos.push('FASE');
      queries.push(
        prisma.historialFaseProceso.findMany({
          where: baseWhere,
          include: {
            usuario: {
              select: { id: true, nombres: true, apellidos: true }
            }
          },
          orderBy: { fecha: 'desc' }
        })
      );
    } else {
      queries.push(Promise.resolve([]));
    }

    if (!filters.tipo || filters.tipo === 'EMPRESA' || filters.tipo === 'ALL') {
      tipos.push('EMPRESA');
      queries.push(
        prisma.historialEmpresaProceso.findMany({
          where: baseWhere,
          include: {
            usuario: {
              select: { id: true, nombres: true, apellidos: true }
            },
            empresa: {
              select: { razonSocial: true, ruc: true }
            }
          },
          orderBy: { fecha: 'desc' }
        })
      );
    } else {
      queries.push(Promise.resolve([]));
    }

    if (!filters.tipo || filters.tipo === 'ACTIVIDAD' || filters.tipo === 'ALL') {
      tipos.push('ACTIVIDAD');
      queries.push(
        prisma.historialActividad.findMany({
          where: baseWhere,
          include: {
            usuario: {
              select: { id: true, nombres: true, apellidos: true }
            },
            actividad: {
              select: {
                id: true,
                nombre: true,
                fase: true
              }
            }
          },
          orderBy: { fecha: 'desc' }
        })
      );
    } else {
      queries.push(Promise.resolve([]));
    }

    // Ejecutar queries en paralelo
    const [trl, estados, fases, empresas, actividades] = await Promise.all(queries);

    // Combinar resultados con tipo
    let eventos = [
      ...trl.map(h => ({ tipo: 'TRL', timestamp: h.fecha, ...h })),
      ...estados.map(h => ({ tipo: 'ESTADO', timestamp: h.fecha, ...h })),
      ...fases.map(h => ({ tipo: 'FASE', timestamp: h.fecha, ...h })),
      ...empresas.map(h => ({ tipo: 'EMPRESA', timestamp: h.fecha, ...h })),
      ...actividades.map(h => ({ tipo: 'ACTIVIDAD', timestamp: h.fecha, ...h }))
    ];

    // ✅ Ordenar solo los eventos recuperados
    eventos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // ✅ Paginación en memoria (ya filtrado)
    const total = eventos.length;
    const paginatedEventos = eventos.slice(skip, skip + take);

    // Formatear eventos
    const eventosFormateados = paginatedEventos.map(evento => {
      let descripcion = '';
      let accion = '';
      let detalle = {};

      switch (evento.tipo) {
        case 'TRL':
          accion = 'ACTUALIZO_TRL';
          descripcion = `${evento.usuario.nombres} ${evento.usuario.apellidos} actualizó TRL de ${evento.trlAnterior || 'inicial'} a ${evento.trlNuevo}`;
          if (evento.justificacion) {
            descripcion += ` - Justificación: "${evento.justificacion}"`;
          }
          detalle = {
            trlAnterior: evento.trlAnterior,
            trlNuevo: evento.trlNuevo,
            fase: evento.fase,
            justificacion: evento.justificacion
          };
          break;

        case 'ESTADO':
          accion = 'CAMBIO_ESTADO';
          descripcion = `${evento.usuario.nombres} ${evento.usuario.apellidos} cambió estado de ${evento.estadoAnterior || 'inicial'} a ${evento.estadoNuevo}`;
          if (evento.motivo) {
            descripcion += ` - Motivo: "${evento.motivo}"`;
          }
          detalle = {
            estadoAnterior: evento.estadoAnterior,
            estadoNuevo: evento.estadoNuevo,
            motivo: evento.motivo
          };
          break;

        case 'FASE':
          accion = 'AVANZO_FASE';
          descripcion = `Sistema avanzó proceso a fase ${evento.faseNueva}`;
          if (evento.faseAnterior) {
            descripcion += ` desde ${evento.faseAnterior}`;
          }
          if (evento.motivo) {
            descripcion += ` - ${evento.motivo}`;
          }
          detalle = {
            faseAnterior: evento.faseAnterior,
            faseNueva: evento.faseNueva,
            motivo: evento.motivo
          };
          break;

        case 'EMPRESA':
          accion = evento.accion;
          descripcion = `${evento.usuario.nombres} ${evento.usuario.apellidos} `;

          switch (evento.accion) {
            case 'VINCULADA':
              descripcion += `vinculó empresa "${evento.empresa.razonSocial}" con rol ${evento.rolNuevo}`;
              break;
            case 'RETIRADA':
              descripcion += `retiró empresa "${evento.empresa.razonSocial}"`;
              break;
            case 'REACTIVADA':
              descripcion += `reactivó empresa "${evento.empresa.razonSocial}"`;
              break;
            case 'ROL_CAMBIADO':
              descripcion += `cambió rol de empresa "${evento.empresa.razonSocial}" de ${evento.rolAnterior} a ${evento.rolNuevo}`;
              break;
            case 'NDA_FIRMADO':
              descripcion += `registró firma de NDA con "${evento.empresa.razonSocial}"`;
              break;
          }

          detalle = {
            empresaId: evento.empresaId,
            razonSocial: evento.empresa.razonSocial,
            ruc: evento.empresa.ruc,
            accion: evento.accion,
            rolAnterior: evento.rolAnterior,
            rolNuevo: evento.rolNuevo,
            motivo: evento.motivo
          };
          break;

        case 'ACTIVIDAD':
          accion = evento.accion;
          descripcion = `${evento.usuario.nombres} ${evento.usuario.apellidos} `;

          switch (evento.accion) {
            case 'CREADA':
              descripcion += `creó actividad "${evento.actividad.nombre}" en fase ${evento.actividad.fase}`;
              break;
            case 'ESTADO_CAMBIADO':
              descripcion += `cambió estado de actividad "${evento.actividad.nombre}" de ${evento.estadoAnterior} a ${evento.estadoNuevo}`;
              break;
            case 'EVIDENCIA_SUBIDA':
              const metadata = evento.metadata || {};
              descripcion += `subió evidencia "${metadata.nombreArchivo || 'archivo'}" en actividad "${evento.actividad.nombre}"`;
              break;
            case 'EVIDENCIA_APROBADA':
              descripcion += `aprobó evidencia en actividad "${evento.actividad.nombre}"`;
              break;
            case 'EVIDENCIA_RECHAZADA':
              descripcion += `rechazó evidencia en actividad "${evento.actividad.nombre}"`;
              break;
            case 'APROBADA':
              descripcion += `aprobó actividad "${evento.actividad.nombre}"`;
              break;
          }

          detalle = {
            actividadId: evento.actividadId,
            nombreActividad: evento.actividad.nombre,
            fase: evento.actividad.fase,
            accion: evento.accion,
            estadoAnterior: evento.estadoAnterior,
            estadoNuevo: evento.estadoNuevo,
            ...evento.metadata
          };
          break;
      }

      return {
        tipo: evento.tipo,
        timestamp: evento.timestamp,
        usuario: evento.usuario,
        accion,
        detalle,
        descripcion
      };
    });

    return {
      historial: eventosFormateados,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getHistorialTRL(procesoId) {
    return await prisma.historialTRL.findMany({
      where: { procesoId },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async getHistorialEstados(procesoId) {
    return await prisma.historialEstadoProceso.findMany({
      where: { procesoId },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async getHistorialFases(procesoId) {
    return await prisma.historialFaseProceso.findMany({
      where: { procesoId },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async getHistorialEmpresas(procesoId) {
    return await prisma.historialEmpresaProceso.findMany({
      where: { procesoId },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        },
        empresa: {
          select: {
            razonSocial: true,
            ruc: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });
  }

  getDetalle(evento) {
    switch (evento.tipo) {
      case 'TRL':
        return {
          trlAnterior: evento.trlAnterior,
          trlNuevo: evento.trlNuevo,
          fase: evento.fase,
          justificacion: evento.justificacion
        };

      case 'ESTADO':
        return {
          estadoAnterior: evento.estadoAnterior,
          estadoNuevo: evento.estadoNuevo,
          motivo: evento.motivo
        };

      case 'FASE':
        return {
          faseAnterior: evento.faseAnterior,
          faseNueva: evento.faseNueva,
          motivo: evento.motivo
        };

      case 'EMPRESA':
        return {
          empresaId: evento.empresaId,
          razonSocial: evento.empresa.razonSocial,
          ruc: evento.empresa.ruc,
          accion: evento.accion,
          rolAnterior: evento.rolAnterior,
          rolNuevo: evento.rolNuevo,
          motivo: evento.motivo
        };

      default:
        return {};
    }
  }
}

export default new HistorialService();