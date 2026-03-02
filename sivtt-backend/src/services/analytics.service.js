import prisma from '../config/database.js';
import { NotFoundError } from '../utils/errors.js';

class AnalyticsService {

  // ==========================================
  // 📊 KPIs GENERALES
  // ==========================================

  async getKPIs() {
    const [
      procesoStats,
      empresaStats,
      grupoStats,
      actividadStats
    ] = await Promise.all([
      // Estadísticas de procesos
      prisma.procesoVinculacion.aggregate({
        where: { deletedAt: null },
        _count: true
      }),
      prisma.procesoVinculacion.count({
        where: { estado: 'ACTIVO', deletedAt: null }
      }),

      // Estadísticas de empresas
      prisma.empresa.aggregate({
        where: { deletedAt: null },
        _count: true
      }),
      prisma.empresa.count({
        where: { verificada: true, deletedAt: null }
      }),

      // Estadísticas de grupos
      prisma.grupoInvestigacion.aggregate({
        where: { deletedAt: null },
        _count: true
      }),
      prisma.grupoInvestigacion.count({
        where: { activo: true, deletedAt: null }
      }),

      // Estadísticas de actividades
      prisma.actividadFase.count({
        where: { estado: 'APROBADA', deletedAt: null }
      }),
      prisma.actividadFase.count({
        where: { 
          estado: { in: ['CREADA', 'EN_PROGRESO', 'EN_REVISION'] },
          deletedAt: null 
        }
      })
    ]);

    // Calcular tendencias (último mes vs mes anterior)
    const fechaHoy = new Date();
    const fechaMesAnterior = new Date();
    fechaMesAnterior.setMonth(fechaMesAnterior.getMonth() - 1);
    const fechaDosMesesAtras = new Date();
    fechaDosMesesAtras.setMonth(fechaDosMesesAtras.getMonth() - 2);

    const [
      procesosUltimoMes,
      procesosMesAnterior,
      empresasUltimoMes,
      empresasMesAnterior,
      gruposUltimoMes,
      gruposMesAnterior
    ] = await Promise.all([
      prisma.procesoVinculacion.count({
        where: { 
          createdAt: { gte: fechaMesAnterior },
          deletedAt: null 
        }
      }),
      prisma.procesoVinculacion.count({
        where: { 
          createdAt: { gte: fechaDosMesesAtras, lt: fechaMesAnterior },
          deletedAt: null 
        }
      }),
      prisma.empresa.count({
        where: { 
          createdAt: { gte: fechaMesAnterior },
          deletedAt: null 
        }
      }),
      prisma.empresa.count({
        where: { 
          createdAt: { gte: fechaDosMesesAtras, lt: fechaMesAnterior },
          deletedAt: null 
        }
      }),
      prisma.grupoInvestigacion.count({
        where: { 
          createdAt: { gte: fechaMesAnterior },
          deletedAt: null 
        }
      }),
      prisma.grupoInvestigacion.count({
        where: { 
          createdAt: { gte: fechaDosMesesAtras, lt: fechaMesAnterior },
          deletedAt: null 
        }
      })
    ]);

    // Calcular porcentajes de tendencia
    const calcularTendencia = (actual, anterior) => {
      if (anterior === 0) return actual > 0 ? 100 : 0;
      return Math.round(((actual - anterior) / anterior) * 100);
    };

    return {
      totalProcesos: procesoStats._count,
      procesosActivos: empresaStats,
      trendProcesos: calcularTendencia(procesosUltimoMes, procesosMesAnterior),
      
      totalEmpresas: empresaStats._count,
      empresasVerificadas: actividadStats[1],
      trendEmpresas: calcularTendencia(empresasUltimoMes, empresasMesAnterior),
      
      totalGrupos: grupoStats._count,
      gruposActivos: actividadStats[1],
      trendGrupos: calcularTendencia(gruposUltimoMes, gruposMesAnterior),
      
      actividadesAprobadas: actividadStats[0],
      actividadesPendientes: actividadStats[1]
    };
  }

  // ==========================================
  // 📈 PROCESOS POR ESTADO
  // ==========================================

  async getProcesosPorEstado(filters = {}) {
    const where = { deletedAt: null };

    // Aplicar filtros si existen
    if (filters.tipoActivo) {
      where.tipoActivo = filters.tipoActivo;
    }

    const resultados = await prisma.procesoVinculacion.groupBy({
      by: ['estado'],
      where,
      _count: true
    });

    return resultados.map(r => ({
      estado: r.estado,
      cantidad: r._count
    }));
  }

  // ==========================================
  // 📊 PROCESOS POR FASE
  // ==========================================

  async getProcesosPorFase(filters = {}) {
    const where = { deletedAt: null };

    if (filters.tipoActivo) {
      where.tipoActivo = filters.tipoActivo;
    }

    const resultados = await prisma.procesoVinculacion.groupBy({
      by: ['faseActual', 'tipoActivo'],
      where,
      _count: true
    });

    // Agrupar por fase
    const porFase = {};
    
    resultados.forEach(r => {
      if (!porFase[r.faseActual]) {
        porFase[r.faseActual] = {
          fase: r.faseActual,
          patentes: 0,
          requerimientos: 0,
          total: 0
        };
      }

      if (r.tipoActivo === 'PATENTE') {
        porFase[r.faseActual].patentes = r._count;
      } else if (r.tipoActivo === 'REQUERIMIENTO_EMPRESARIAL') {
        porFase[r.faseActual].requerimientos = r._count;
      }

      porFase[r.faseActual].total += r._count;
    });

    return Object.values(porFase);
  }

  // ==========================================
  // 🔬 DISTRIBUCIÓN DE TRL
  // ==========================================

  async getTRLDistribution() {
    const resultados = await prisma.procesoVinculacion.groupBy({
      by: ['trlActual'],
      where: {
        tipoActivo: 'PATENTE',
        trlActual: { not: null },
        deletedAt: null
      },
      _count: true
    });

    return resultados.map(r => ({
      nivel: r.trlActual,
      cantidad: r._count
    })).sort((a, b) => a.nivel - b.nivel);
  }

  // ==========================================
  // ✅ ACTIVIDADES POR ESTADO
  // ==========================================

  async getActividadesPorEstado(filters = {}) {
    const where = { deletedAt: null };

    if (filters.fase) {
      where.fase = filters.fase;
    }

    const resultados = await prisma.actividadFase.groupBy({
      by: ['estado'],
      where,
      _count: true
    });

    return resultados.map(r => ({
      estado: r.estado,
      cantidad: r._count
    }));
  }

  // ==========================================
  // 📅 TIMELINE DE CREACIÓN
  // ==========================================

  async getTimeline(filters = {}) {
    const periodo = filters.periodo || 'ultimo_ano';
    
    let fechaInicio = new Date();
    
    switch (periodo) {
      case 'ultimo_mes':
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        break;
      case 'ultimo_trimestre':
        fechaInicio.setMonth(fechaInicio.getMonth() - 3);
        break;
      case 'ultimo_semestre':
        fechaInicio.setMonth(fechaInicio.getMonth() - 6);
        break;
      case 'ultimo_ano':
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        break;
      case 'todo':
        fechaInicio = new Date('2000-01-01');
        break;
    }

    // Obtener todos los procesos creados desde la fecha de inicio
    const procesos = await prisma.procesoVinculacion.findMany({
      where: {
        createdAt: { gte: fechaInicio },
        deletedAt: null
      },
      select: {
        createdAt: true,
        tipoActivo: true
      },
      orderBy: { createdAt: 'asc' }
    });

    // Agrupar por mes
    const porMes = {};

    procesos.forEach(p => {
      const fecha = new Date(p.createdAt);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-01`;

      if (!porMes[key]) {
        porMes[key] = {
          fecha: key,
          patentes: 0,
          requerimientos: 0,
          total: 0
        };
      }

      if (p.tipoActivo === 'PATENTE') {
        porMes[key].patentes++;
      } else if (p.tipoActivo === 'REQUERIMIENTO_EMPRESARIAL') {
        porMes[key].requerimientos++;
      }

      porMes[key].total++;
    });

    return Object.values(porMes).sort((a, b) => 
      new Date(a.fecha) - new Date(b.fecha)
    );
  }

  // ==========================================
  // 🏢 TOP EMPRESAS
  // ==========================================

  async getTopEmpresas(filters = {}) {
    const limit = parseInt(filters.limit) || 10;

    // Obtener empresas con conteo de procesos vinculados
    const empresas = await prisma.empresa.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        razonSocial: true,
        nombreComercial: true,
        sector: true,
        departamento: true,
        provincia: true,
        distrito: true,
        verificada: true,
        _count: {
          select: {
            procesos: {
              where: {
                estado: 'ACTIVA',
                deletedAt: null
              }
            }
          }
        }
      }
    });

    // Obtener conteo de NDAs firmados por empresa
    const ndaStats = await prisma.procesoEmpresa.groupBy({
      by: ['empresaId'],
      where: {
        ndaFirmado: true,
        deletedAt: null
      },
      _count: true
    });

    const ndaMap = new Map(
      ndaStats.map(stat => [stat.empresaId, stat._count])
    );

    // Formatear y ordenar
    const empresasFormateadas = empresas
      .map(e => ({
        id: e.id,
        nombre: e.nombreComercial || e.razonSocial,
        sector: e.sector,
        ubicacion: [e.distrito, e.provincia, e.departamento]
          .filter(Boolean)
          .join(', '),
        verificada: e.verificada,
        procesosVinculados: e._count.procesos,
        ndaFirmados: ndaMap.get(e.id) || 0
      }))
      .filter(e => e.procesosVinculados > 0)
      .sort((a, b) => b.procesosVinculados - a.procesosVinculados)
      .slice(0, limit);

    return empresasFormateadas;
  }

  // ==========================================
  // 🔔 ACTIVIDAD RECIENTE
  // ==========================================

  async getRecentActivity(filters = {}) {
    const limit = parseInt(filters.limit) || 20;

    const actividades = await prisma.historialActividad.findMany({
      take: limit,
      orderBy: { fecha: 'desc' },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true
          }
        },
        proceso: {
          select: {
            id: true,
            codigo: true,
            titulo: true
          }
        },
        actividad: {
          select: {
            id: true,
            nombre: true,
            tipo: true
          }
        }
      }
    });

    return actividades.map(a => {
      let titulo = '';
      let descripcion = '';
      let tipoEvento = 'OTRO';

      switch (a.accion) {
        case 'CREADA':
          titulo = `Nueva actividad: ${a.actividad.nombre}`;
          descripcion = `Actividad creada en el proceso ${a.proceso.codigo}`;
          tipoEvento = 'ACTIVIDAD';
          break;
        case 'ESTADO_CAMBIADO':
          titulo = `Cambio de estado: ${a.actividad.nombre}`;
          descripcion = `De ${a.estadoAnterior} a ${a.estadoNuevo}`;
          tipoEvento = 'ESTADO';
          break;
        case 'EVIDENCIA_SUBIDA':
          titulo = `Evidencia subida: ${a.actividad.nombre}`;
          descripcion = `Nueva evidencia en ${a.proceso.codigo}`;
          tipoEvento = 'EVIDENCIA';
          break;
        case 'EVIDENCIA_APROBADA':
          titulo = `Evidencia aprobada: ${a.actividad.nombre}`;
          descripcion = `Evidencia aprobada en ${a.proceso.codigo}`;
          tipoEvento = 'DECISION';
          break;
        case 'APROBADA':
          titulo = `Actividad aprobada: ${a.actividad.nombre}`;
          descripcion = `Actividad completada en ${a.proceso.codigo}`;
          tipoEvento = 'DECISION';
          break;
        default:
          titulo = a.actividad.nombre;
          descripcion = `Actividad en ${a.proceso.codigo}`;
      }

      return {
        id: a.id,
        titulo,
        descripcion,
        tipoEvento,
        fecha: a.fecha,
        usuario: {
          nombre: `${a.usuario.nombres} ${a.usuario.apellidos}`
        },
        proceso: {
          codigo: a.proceso.codigo,
          titulo: a.proceso.titulo
        }
      };
    });
  }

  // ==========================================
  // 📊 MÉTRICAS POR TIPO DE PROCESO
  // ==========================================

  async getMetricasPorTipo() {
    // Métricas de PATENTE
    const patentes = await prisma.procesoVinculacion.aggregate({
      where: {
        tipoActivo: 'PATENTE',
        deletedAt: null
      },
      _count: true,
      _avg: {
        trlActual: true
      }
    });

    // Métricas de REQUERIMIENTO
    const requerimientos = await prisma.procesoVinculacion.count({
      where: {
        tipoActivo: 'REQUERIMIENTO_EMPRESARIAL',
        deletedAt: null
      }
    });

    // Contar requerimientos con ganador
    const requerimientosConGanador = await prisma.postulacionGrupo.count({
      where: {
        seleccionado: true,
        deletedAt: null
      }
    });

    return {
      patentes: {
        total: patentes._count,
        trlPromedio: patentes._avg.trlActual || 0
      },
      requerimientos: {
        total: requerimientos,
        conGanador: requerimientosConGanador
      }
    };
  }
}

export default new AnalyticsService();