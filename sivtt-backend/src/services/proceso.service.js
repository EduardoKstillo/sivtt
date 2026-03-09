import prisma from '../config/database.js';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class ProcesoService {

  // ========================================
  // 📊 ESTADÍSTICAS Y MÉTRICAS
  // ========================================

  async calculateStats(procesoId, tipoActivo) {
    // Si no se pasa tipoActivo, lo obtenemos nosotros
    let tipo = tipoActivo;
    if (!tipo) {
      const proceso = await prisma.procesoVinculacion.findFirst({
        where: { id: procesoId, deletedAt: null },
        select: { tipoActivo: true }
      });
      tipo = proceso?.tipoActivo;
    }

    const stats = await prisma.actividadFase.groupBy({
      by: ['estado'],
      where: { procesoId, deletedAt: null },
      _count: true
    });

    const totales = {
      actividadesTotales: 0,
      actividadesCompletadas: 0,
      actividadesPendientes: 0,
      actividadesObservadas: 0,
      empresasVinculadas: 0
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

    if (tipo === 'PATENTE') {
      totales.empresasVinculadas = await prisma.procesoEmpresa.count({
        where: { procesoId, estado: 'ACTIVA', deletedAt: null }
      });
    }

    return totales;
  }

  // ========================================
  // 📋 LISTADO
  // ========================================

  async list(filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = { deletedAt: null };

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
          // ✅ Usuarios del proceso con su rol (relación nueva)
          usuarios: {
            include: {
              rol: {
                select: { id: true, codigo: true, nombre: true }
              },
              usuario: {
                select: { id: true, nombres: true, apellidos: true, email: true }
              }
            }
          },
          _count: {
            select: {
              actividades: { where: { deletedAt: null } },
              empresas: { where: { estado: 'ACTIVA', deletedAt: null } }
            }
          }
        }
      }),
      prisma.procesoVinculacion.count({ where })
    ]);

    const processedProcesos = procesos.map(p => ({
      ...p,
      usuarios: p.usuarios.map(pu => ({
        ...pu.usuario,
        rol: pu.rol
      })),
      actividadesTotales: p._count.actividades,
      empresasVinculadas: p._count.empresas,
      _count: undefined
    }));

    return buildPaginatedResponse(processedProcesos, total, page, limit);
  }

  // ========================================
  // 🔍 DETALLE
  // ========================================

  async getById(id) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id, deletedAt: null },
      include: {
        usuarios: {
          include: {
            usuario: {
              select: { id: true, nombres: true, apellidos: true, email: true }
            },
            rol: {
              select: { id: true, codigo: true, nombre: true }
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
            _count: {
              select: { actividades: { where: { deletedAt: null } } }
            }
          }
        }
      }
    });

    if (!proceso) throw new NotFoundError('Proceso');

    const stats = await this.calculateStats(id, proceso.tipoActivo);

    const fasesResumen = proceso.fases.map(f => ({
      fase: f.fase,
      estado: f.estado,
      fechaInicio: f.fechaInicio,
      fechaFin: f.fechaFin,
      actividadesTotales: f._count.actividades
    }));

    return {
      ...proceso,
      ...stats,
      usuarios: proceso.usuarios.map(pu => ({
        ...pu.usuario,
        rol: pu.rol
      })),
      fasesResumen,
      fases: undefined
    };
  }

  // ========================================
  // ➕ CREAR
  // ========================================

async create(data, userId) {
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

    // 🔥 El backend busca automáticamente el rol correcto
    const rolGestor = await prisma.rol.findUnique({
      where: { codigo: 'GESTOR_PROCESO' }
    });

    if (!rolGestor || rolGestor.ambito !== 'PROCESO') {
      throw new ValidationError('El rol GESTOR_PROCESO no está configurado correctamente en el sistema');
    }

    const codigo = await this.generateCodigo();
    const faseInicial = data.tipoActivo === 'PATENTE' ? 'CARACTERIZACION' : 'FORMULACION_RETO';

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
              rolId: rolGestor.id // 🔥 Inyectamos el ID encontrado
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

      await tx.historialEstadoProceso.create({
        data: {
          procesoId: nuevoProceso.id,
          estadoAnterior: null,
          estadoNuevo: 'ACTIVO',
          motivo: 'Proceso creado',
          modificadoPor: userId
        }
      });

      await tx.historialFaseProceso.create({
        data: {
          procesoId: nuevoProceso.id,
          faseAnterior: null,
          faseNueva: faseInicial,
          motivo: 'Inicio de proceso',
          modificadoPor: userId
        }
      });

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

    if (!proceso) throw new NotFoundError('Proceso');

    const allowedUpdates = {
      titulo: data.titulo,
      descripcion: data.descripcion
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
        fases: { where: { deletedAt: null } },
        actividades: { where: { deletedAt: null }, take: 1 },
        empresas: { where: { deletedAt: null }, take: 1 },
        financiamientos: { where: { deletedAt: null }, take: 1 }
      }
    });

    if (!proceso) throw new NotFoundError('Proceso');

    const errores = [];
    if (proceso.fases.some(f => f.estado === 'ABIERTA')) errores.push('Existen fases abiertas');
    if (proceso.actividades.length > 0) errores.push('Existen actividades registradas');
    if (proceso.empresas.length > 0) errores.push('Existen empresas vinculadas');
    if (proceso.financiamientos.length > 0) errores.push('Existen financiamientos registrados');
    if (proceso.estado === 'ACTIVO') errores.push('El proceso está activo (debe estar CANCELADO o FINALIZADO)');

    if (errores.length > 0) {
      throw new ValidationError(`No se puede eliminar el proceso: ${errores.join(', ')}`);
    }

    return await prisma.procesoVinculacion.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // ========================================
  // 📊 TRL
  // ========================================

  async updateTRL(id, nuevoTRL, justificacion, userId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id, deletedAt: null }
    });

    if (!proceso) throw new NotFoundError('Proceso');

    if (proceso.tipoActivo !== 'PATENTE') {
      throw new ValidationError('Solo procesos tipo PATENTE tienen TRL');
    }

    if (nuevoTRL < 1 || nuevoTRL > 9) {
      throw new ValidationError('TRL debe estar entre 1 y 9');
    }

    if (nuevoTRL < proceso.trlActual) {
      throw new ValidationError('No se puede retroceder el TRL. Use una decisión de fase para retroceder.');
    }

    this.validateTRLFaseCoherence(nuevoTRL, proceso.faseActual);

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

  validateTRLFaseCoherence(trl, fase) {
    const rangosPorFase = {
      CARACTERIZACION: [1, 3],
      ENRIQUECIMIENTO: [3, 5],
      MATCH: [4, 6],
      ESCALAMIENTO: [6, 8],
      TRANSFERENCIA: [7, 9]
    };

    const rango = rangosPorFase[fase];
    if (!rango) return;

    const [min, max] = rango;
    if (trl < min || trl > max) {
      throw new ValidationError(
        `TRL ${trl} no es coherente con fase ${fase} (esperado: ${min}-${max})`
      );
    }
  }

  // ========================================
  // 📊 ACTUALIZAR CONTADORES
  // ========================================

  async updateStats(procesoId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null },
      select: { tipoActivo: true }
    });

    if (!proceso) throw new NotFoundError('Proceso');

    // ✅ Pasar tipoActivo para evitar query adicional dentro de calculateStats
    const stats = await this.calculateStats(procesoId, proceso.tipoActivo);

    await prisma.procesoVinculacion.update({
      where: { id: procesoId },
      data: stats
    });
  }

  async updateEmpresasCounter(procesoId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null },
      select: { tipoActivo: true }
    });

    if (!proceso) throw new NotFoundError('Proceso');
    if (proceso.tipoActivo !== 'PATENTE') return;

    const count = await prisma.procesoEmpresa.count({
      where: { procesoId, estado: 'ACTIVA', deletedAt: null }
    });

    await prisma.procesoVinculacion.update({
      where: { id: procesoId },
      data: { empresasVinculadas: count }
    });
  }

  // ========================================
  // 👥 GESTIÓN DE USUARIOS EN EL PROCESO
  // ========================================

  async assignUsuario(procesoId, usuarioId, rolId) {
    const [proceso, usuario, rol] = await Promise.all([
      prisma.procesoVinculacion.findFirst({ where: { id: procesoId, deletedAt: null } }),
      prisma.usuario.findFirst({ where: { id: usuarioId, activo: true, deletedAt: null } }),
      prisma.rol.findFirst({ where: { id: rolId, ambito: 'PROCESO', activo: true } })
    ]);

    if (!proceso) throw new NotFoundError('Proceso');
    if (!usuario) throw new NotFoundError('Usuario activo');
    if (!rol) throw new ValidationError('El rol no existe o no es de ámbito PROCESO');

    const existing = await prisma.procesoUsuario.findFirst({
      where: { procesoId, usuarioId, rolId }
    });

    if (existing) throw new ConflictError('El usuario ya tiene este rol en el proceso');

    return await prisma.procesoUsuario.create({
      data: { procesoId, usuarioId, rolId },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, email: true } },
        rol: { select: { id: true, codigo: true, nombre: true } }
      }
    });
  }

  async removeUsuario(procesoId, usuarioId) {
    // Verificar que no se quede sin ningún usuario con rol de gestión
    const vinculaciones = await prisma.procesoUsuario.findMany({
      where: { procesoId },
      include: { rol: { select: { codigo: true } } }
    });

    const vinculacionesUsuario = vinculaciones.filter(v => v.usuarioId === usuarioId);
    if (vinculacionesUsuario.length === 0) {
      throw new NotFoundError('Vinculación de usuario en el proceso');
    }

    // Verificar que el proceso quede con al menos un gestor
    const codigosGestion = ['GESTOR_VINCULACION', 'ADMIN_SISTEMA'];
    const gestoresRestantes = vinculaciones.filter(
      v => v.usuarioId !== usuarioId && codigosGestion.includes(v.rol.codigo)
    );

    const esGestor = vinculacionesUsuario.some(v => codigosGestion.includes(v.rol.codigo));

    if (esGestor && gestoresRestantes.length === 0) {
      throw new ValidationError('No se puede remover al único gestor del proceso');
    }

    await prisma.procesoUsuario.deleteMany({ where: { procesoId, usuarioId } });
  }

  // ========================================
  // 🔧 UTILIDADES
  // ========================================

  async generateCodigo() {
    const year = new Date().getFullYear();
    const secuenciaId = `PROC-${year}`;

    // Operación atómica: Busca el ID, si existe le suma 1, si no existe lo crea empezando en 1
    const secuencia = await prisma.secuenciaSistema.upsert({
      where: { id: secuenciaId },
      update: {
        valor: { increment: 1 }
      },
      create: {
        id: secuenciaId,
        valor: 1
      }
    });

    // Formateamos el código con ceros a la izquierda (Ej: PROC-2026-001)
    return `${secuenciaId}-${String(secuencia.valor).padStart(3, '0')}`;
  }
}

export default new ProcesoService();