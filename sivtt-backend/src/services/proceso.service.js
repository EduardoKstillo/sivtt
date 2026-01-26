import prisma from '../config/database.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class ProcesoService {

  // ========================================
  // 📊 ESTADÍSTICAS Y MÉTRICAS
  // ========================================

  /**
   * Calcula todas las estadísticas de un proceso
   * Usa aggregates eficientes en lugar de múltiples queries
   */
  async calculateStats(procesoId, tipoActivo) {
    const stats = await prisma.actividadFase.groupBy({
      by: ['estado'],
      where: {
        procesoId,
        deletedAt: null
      },
      _count: true
    });

    const totales = {
      actividadesTotales: 0,
      actividadesCompletadas: 0,
      actividadesPendientes: 0,
      actividadesObservadas: 0,
      empresasVinculadas: 0 // Inicializamos siempre en 0
    };

    stats.forEach(stat => {
      totales.actividadesTotales += stat._count;

      if (stat.estado === 'APROBADA') {
        totales.actividadesCompletadas = stat._count;
      } else if (stat.estado === 'OBSERVADA') {
        totales.actividadesObservadas = stat._count;
      } else if (['CREADA', 'EN_PROGRESO', 'EN_REVISION'].includes(stat.estado)) {
        totales.actividadesPendientes += stat._count;
      }
    });

    // Ahora usamos el parámetro tipoActivo correctamente
    if (tipoActivo === 'PATENTE') {
      totales.empresasVinculadas = await prisma.procesoEmpresa.count({
        where: {
          procesoId,
          estado: 'ACTIVA',
          deletedAt: null
        }
      });
    }

    return totales;
  }

  // ========================================
  // 📋 LISTADO
  // ========================================

  async list(filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      deletedAt: null
    };

    if (filters.tipoActivo) where.tipoActivo = filters.tipoActivo;
    if (filters.estado) where.estado = filters.estado;
    if (filters.faseActual) where.faseActual = filters.faseActual;

    if (filters.search) {
      where.OR = [
        { codigo: { contains: filters.search, mode: 'insensitive' } },
        { titulo: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [procesos, total] = await Promise.all([
      prisma.procesoVinculacion.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        // 🔥 Incluir solo lo necesario para la lista
        select: {
          id: true,
          codigo: true,
          tipoActivo: true,
          titulo: true,
          descripcion: true,
          estado: true,
          faseActual: true,
          trlInicial: true,
          trlActual: true,
          createdAt: true,
          updatedAt: true,
          // ✅ Usuarios con su rol
          usuarios: {
            where: {
              rolProceso: 'RESPONSABLE_PROCESO'
            },
            select: {
              rolProceso: true,
              usuario: {
                select: {
                  id: true,
                  nombres: true,
                  apellidos: true,
                  email: true
                }
              }
            }
          },
          // 🔥 Pre-calcular contadores básicos
          _count: {
            select: {
              actividades: {
                where: { deletedAt: null }
              },
              empresas: {
                where: { estado: 'ACTIVA', deletedAt: null }
              }
            }
          }
        }
      }),
      prisma.procesoVinculacion.count({ where })
    ]);

    // Enriquecer con nombres user-friendly
    const processedProcesos = procesos.map(p => ({
      ...p,
      actividadesTotales: p._count.actividades,
      empresasVinculadas: p._count.empresas,
      _count: undefined // Remover objeto interno
    }));

    return buildPaginatedResponse(processedProcesos, total, page, limit);
  }

  // ========================================
  // 🔍 DETALLE (VISIÓN GENERAL)
  // ========================================

  async getById(id) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id, deletedAt: null },
      include: {
        usuarios: {
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
        },
        fases: {
          where: { deletedAt: null },
          orderBy: { fechaInicio: 'asc' },
          select: {
            id: true,
            fase: true,
            estado: true,
            fechaInicio: true,
            fechaFin: true,
            // 🔥 Pre-calcular estadísticas por fase
            _count: {
              select: {
                actividades: {
                  where: { deletedAt: null }
                }
              }
            }
          }
        }
      }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    // 🔥 Calcular estadísticas completas
    const stats = await this.calculateStats(id, proceso.tipoActivo);

    // 🔥 Enriquecer fases con contadores
    const fasesResumen = proceso.fases.map(f => ({
      fase: f.fase,
      estado: f.estado,
      fechaInicio: f.fechaInicio,
      fechaFin: f.fechaFin,
      actividadesTotales: f._count.actividades
    }));

    return {
      ...proceso,
      ...stats, // 🔥 Estadísticas agregadas
      usuarios: proceso.usuarios.map(pu => ({
        ...pu.usuario,
        rolProceso: pu.rolProceso
      })),
      fasesResumen,
      fases: undefined // Remover objeto raw
    };
  }

  // ========================================
  // ➕ CREAR
  // ========================================

  async create(data, userId) {
    // Validar unicidad
    const existing = await prisma.procesoVinculacion.findFirst({
      where: {
        sistemaOrigen: data.sistemaOrigen,
        evaluacionId: data.evaluacionId,
        deletedAt: null
      }
    });

    if (existing) {
      throw new ConflictError('Ya existe un proceso activo con este sistemaOrigen y evaluacionId');
    }

    const codigo = await this.generateCodigo();
    const faseInicial = data.tipoActivo === 'PATENTE' ? 'CARACTERIZACION' : 'FORMULACION_RETO';

    // 🔥 Transacción completa
    const proceso = await prisma.$transaction(async (tx) => {
      const nuevoProceso = await tx.procesoVinculacion.create({
        data: {
          codigo,
          tipoActivo: data.tipoActivo,
          sistemaOrigen: data.sistemaOrigen,
          evaluacionId: data.evaluacionId,
          titulo: data.titulo,
          descripcion: data.descripcion,
          trlInicial: data.trlInicial,
          trlActual: data.trlInicial,
          estado: 'ACTIVO',
          faseActual: faseInicial,
          usuarios: {
            create: {
              usuarioId: data.responsableId,
              rolProceso: 'RESPONSABLE_PROCESO'
            }
          },
          fases: {
            create: {
              fase: faseInicial,
              estado: 'ABIERTA',
              responsableId: data.responsableId
            }
          }
        }
      });

      // Historial de estado
      await tx.historialEstadoProceso.create({
        data: {
          procesoId: nuevoProceso.id,
          estadoAnterior: null,
          estadoNuevo: 'ACTIVO',
          motivo: 'Proceso creado',
          modificadoPor: userId
        }
      });

      // Historial de fase
      await tx.historialFaseProceso.create({
        data: {
          procesoId: nuevoProceso.id,
          faseAnterior: null,
          faseNueva: faseInicial,
          motivo: 'Inicio de proceso',
          modificadoPor: userId
        }
      });

      // Historial de TRL (solo PATENTE)
      if (data.trlInicial && data.tipoActivo === 'PATENTE') {
        await tx.historialTRL.create({
          data: {
            procesoId: nuevoProceso.id,
            fase: faseInicial,
            trlAnterior: null,
            trlNuevo: data.trlInicial,
            justificacion: 'TRL inicial del proceso',
            modificadoPor: userId
          }
        });
      }

      return nuevoProceso;
    });

    return proceso;
  }

  // ========================================
  // ✏️ ACTUALIZAR
  // ========================================

  async update(id, data) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    // 🔥 Solo permitir actualizar campos seguros
    const allowedUpdates = {
      titulo: data.titulo,
      descripcion: data.descripcion
      // NO permitir cambiar: tipoActivo, estado, faseActual, TRL, etc.
    };

    return await prisma.procesoVinculacion.update({
      where: { id },
      data: Object.fromEntries(
        Object.entries(allowedUpdates).filter(([_, v]) => v !== undefined)
      )
    });
  }

  // ========================================
  // 🗑️ ELIMINAR
  // ========================================

  async delete(id) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id, deletedAt: null },
      include: {
        fases: {
          where: { deletedAt: null }
        },
        actividades: {
          where: { deletedAt: null },
          take: 1
        },
        empresas: {
          where: { deletedAt: null },
          take: 1
        },
        financiamientos: {
          where: { deletedAt: null },
          take: 1
        }
      }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    // 🔥 Reglas de negocio estrictas para eliminación
    const errores = [];

    if (proceso.fases.some(f => f.estado === 'ABIERTA')) {
      errores.push('Existen fases abiertas');
    }

    if (proceso.actividades.length > 0) {
      errores.push('Existen actividades registradas');
    }

    if (proceso.empresas.length > 0) {
      errores.push('Existen empresas vinculadas');
    }

    if (proceso.financiamientos.length > 0) {
      errores.push('Existen financiamientos registrados');
    }

    if (proceso.estado === 'ACTIVO') {
      errores.push('El proceso está activo (debe estar CANCELADO o FINALIZADO)');
    }

    if (errores.length > 0) {
      throw new ValidationError(`No se puede eliminar el proceso: ${errores.join(', ')}`);
    }

    // Soft delete
    return await prisma.procesoVinculacion.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // ========================================
  // 📊 ACTUALIZAR TRL
  // ========================================

  async updateTRL(id, nuevoTRL, justificacion, userId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    // 🔥 Validaciones completas
    if (proceso.tipoActivo !== 'PATENTE') {
      throw new ValidationError('Solo procesos tipo PATENTE tienen TRL');
    }

    if (nuevoTRL < 1 || nuevoTRL > 9) {
      throw new ValidationError('TRL debe estar entre 1 y 9');
    }

    if (nuevoTRL < proceso.trlActual) {
      throw new ValidationError('No se puede retroceder el TRL. Use una decisión de fase para retroceder.');
    }

    // 🔥 Validar coherencia TRL-Fase
    this.validateTRLFaseCoherence(nuevoTRL, proceso.faseActual);

    // Transacción
    const [updated] = await prisma.$transaction([
      prisma.procesoVinculacion.update({
        where: { id },
        data: { trlActual: nuevoTRL }
      }),
      prisma.historialTRL.create({
        data: {
          procesoId: id,
          fase: proceso.faseActual,
          trlAnterior: proceso.trlActual,
          trlNuevo: nuevoTRL,
          justificacion,
          modificadoPor: userId
        }
      })
    ]);

    return updated;
  }

  /**
   * 🔥 Valida coherencia entre TRL y fase actual
   */
  validateTRLFaseCoherence(trl, fase) {
    const rangosPorFase = {
      CARACTERIZACION: [1, 3],
      ENRIQUECIMIENTO: [3, 5],
      MATCH: [4, 6],
      ESCALAMIENTO: [6, 8],
      TRANSFERENCIA: [7, 9]
    };

    const rango = rangosPorFase[fase];
    if (!rango) return; // Fase sin TRL asociado

    const [min, max] = rango;
    if (trl < min || trl > max) {
      throw new ValidationError(
        `TRL ${trl} no es coherente con fase ${fase} (esperado: ${min}-${max})`
      );
    }
  }

  /**
 * Actualizar estadísticas completas del proceso
 * Método público para uso por otros servicios
 */
  async updateStats(procesoId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null },
      select: { tipoActivo: true }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    const stats = await this.calculateStats(procesoId);

    await prisma.procesoVinculacion.update({
      where: { id: procesoId },
      data: stats
    });
  }

  /**
   * Actualizar contador de empresas vinculadas
   * Método público para uso por EmpresaService
   */
  async updateEmpresasCounter(procesoId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null },
      select: { tipoActivo: true }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    if (proceso.tipoActivo !== 'PATENTE') {
      return; // Solo PATENTE tiene empresas
    }

    const count = await prisma.procesoEmpresa.count({
      where: {
        procesoId,
        estado: 'ACTIVA',
        deletedAt: null
      }
    });

    await prisma.procesoVinculacion.update({
      where: { id: procesoId },
      data: { empresasVinculadas: count }
    });
  }

  // ========================================
  // 👥 GESTIÓN DE USUARIOS
  // ========================================

  async assignUsuario(procesoId, usuarioId, rolProceso) {
    const [proceso, usuario] = await Promise.all([
      prisma.procesoVinculacion.findFirst({
        where: { id: procesoId, deletedAt: null }
      }),
      prisma.usuario.findUnique({
        where: { id: usuarioId, activo: true }
      })
    ]);

    if (!proceso) throw new NotFoundError('Proceso');
    if (!usuario) throw new NotFoundError('Usuario activo');

    const existing = await prisma.procesoUsuario.findFirst({
      where: { procesoId, usuarioId, rolProceso }
    });

    if (existing) {
      throw new ConflictError('El usuario ya tiene este rol en el proceso');
    }

    return await prisma.procesoUsuario.create({
      data: { procesoId, usuarioId, rolProceso }
    });
  }

  async removeUsuario(procesoId, usuarioId) {
    // 🔥 Validar que no sea el único responsable
    const responsables = await prisma.procesoUsuario.count({
      where: {
        procesoId,
        rolProceso: 'RESPONSABLE_PROCESO'
      }
    });

    const isResponsable = await prisma.procesoUsuario.findFirst({
      where: {
        procesoId,
        usuarioId,
        rolProceso: 'RESPONSABLE_PROCESO'
      }
    });

    if (isResponsable && responsables === 1) {
      throw new ValidationError('No se puede remover al único responsable del proceso');
    }

    await prisma.procesoUsuario.deleteMany({
      where: { procesoId, usuarioId }
    });
  }

  // ========================================
  // 🔧 UTILIDADES
  // ========================================

  async generateCodigo() {
    const year = new Date().getFullYear();

    const count = await prisma.procesoVinculacion.count({
      where: {
        codigo: {
          startsWith: `PROC-${year}-`
        }
      }
    });

    return `PROC-${year}-${String(count + 1).padStart(3, '0')}`;
  }
}

export default new ProcesoService();