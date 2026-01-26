import prisma from '../config/database.js';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';
import procesoService from './proceso.service.js';

class EmpresaService {
  async list(filters) {
    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      deletedAt: null
    };

    if (filters.sector) where.sector = filters.sector;
    if (filters.verificada !== undefined) where.verificada = filters.verificada === 'true';
    if (filters.search) {
      where.OR = [
        { razonSocial: { contains: filters.search, mode: 'insensitive' } },
        { ruc: { contains: filters.search } },
        { nombreComercial: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          razonSocial: true,
          ruc: true,
          nombreComercial: true,
          sector: true,
          tamaño: true,
          departamento: true,
          provincia: true,
          distrito: true,
          direccion: true,
          contactoPrincipal: true,
          cargoContacto: true,
          email: true,
          telefono: true,
          verificada: true,
          fechaVerificacion: true,
          createdAt: true,
          _count: {
            select: {
              procesos: {
                where: { deletedAt: null }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.empresa.count({ where })
    ]);

    const empresasFormateadas = empresas.map(e => ({
      ...e,
      procesosVinculados: e._count.procesos
    }));

    return buildPaginatedResponse(empresasFormateadas, total, page, limit);
  }

  async listDisponibles(procesoId, filters) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    if (proceso.tipoActivo !== 'PATENTE') {
      throw new ValidationError('Solo procesos tipo PATENTE pueden vincular empresas');
    }

    // Obtener IDs de empresas ya vinculadas (activas o retiradas)
    const vinculadas = await prisma.procesoEmpresa.findMany({
      where: { procesoId, deletedAt: null },
      select: { empresaId: true }
    });

    const idsVinculadas = vinculadas.map(v => v.empresaId);

    const { skip, take, page, limit } = getPagination(filters.page, filters.limit);

    const where = {
      deletedAt: null,
      verificada: true, // Solo empresas verificadas
      id: {
        notIn: idsVinculadas // Excluir ya vinculadas
      }
    };

    // Filtros opcionales
    if (filters.search) {
      where.OR = [
        { razonSocial: { contains: filters.search, mode: 'insensitive' } },
        { ruc: { contains: filters.search } },
        { nombreComercial: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.sector) {
      where.sector = filters.sector;
    }

    const [empresas, total] = await Promise.all([
      prisma.empresa.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          razonSocial: true,
          ruc: true,
          nombreComercial: true,
          sector: true,
          tamaño: true,
          departamento: true,
          provincia: true,
          distrito: true,
          contactoPrincipal: true,
          cargoContacto: true,
          email: true,
          telefono: true,
          verificada: true,
          fechaVerificacion: true
        },
        orderBy: { razonSocial: 'asc' }
      }),
      prisma.empresa.count({ where })
    ]);

    return buildPaginatedResponse(empresas, total, page, limit);
  }

  async getById(id) {
    const empresa = await prisma.empresa.findFirst({
      where: { id, deletedAt: null },
      include: {
        procesos: {
          where: { deletedAt: null },
          include: {
            proceso: {
              select: {
                id: true,
                codigo: true,
                titulo: true,
                tipoActivo: true,
                estado: true
              }
            }
          }
        }
      }
    });

    if (!empresa) {
      throw new NotFoundError('Empresa');
    }

    return {
      ...empresa,
      procesos: empresa.procesos.map(pe => ({
        procesoId: pe.procesoId,
        proceso: pe.proceso,
        rolEmpresa: pe.rolEmpresa,
        estado: pe.estado,
        ndaFirmado: pe.ndaFirmado,
        fechaVinculacion: pe.fechaVinculacion
      }))
    };
  }

  async create(data) {
    const existing = await prisma.empresa.findFirst({
      where: { ruc: data.ruc }
    });

    if (existing) {
      throw new ConflictError('Ya existe una empresa con este RUC');
    }

    return await prisma.empresa.create({
      data
    });
  }

  async update(id, data) {
    const empresa = await prisma.empresa.findFirst({
      where: { id, deletedAt: null }
    });

    if (!empresa) {
      throw new NotFoundError('Empresa');
    }

    return await prisma.empresa.update({
      where: { id },
      data
    });
  }

  async verify(id, verificada) {
    const empresa = await prisma.empresa.findFirst({
      where: { id, deletedAt: null }
    });

    if (!empresa) {
      throw new NotFoundError('Empresa');
    }

    return await prisma.empresa.update({
      where: { id },
      data: {
        verificada,
        fechaVerificacion: verificada ? new Date() : null
      }
    });
  }

  async delete(id) {
    const empresa = await prisma.empresa.findFirst({
      where: { id, deletedAt: null },
      include: {
        procesos: {
          where: {
            estado: 'ACTIVA',
            deletedAt: null
          }
        }
      }
    });

    if (!empresa) {
      throw new NotFoundError('Empresa');
    }

    // 🔥 VALIDACIÓN MEJORADA
    if (empresa.procesos.length > 0) {
      const codigosProcesos = empresa.procesos.map(p => p.proceso?.codigo || p.procesoId).join(', ');
      throw new ValidationError(
        `No se puede eliminar la empresa. Tiene ${empresa.procesos.length} proceso(s) activo(s) vinculado(s): ${codigosProcesos}`
      );
    }

    return await prisma.empresa.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async listByProceso(procesoId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    if (proceso.tipoActivo !== 'PATENTE') {
      throw new ValidationError('Solo procesos tipo PATENTE pueden tener empresas vinculadas');
    }

    return await prisma.procesoEmpresa.findMany({
      where: { procesoId, deletedAt: null },
      include: {
        empresa: true
      },
      orderBy: { fechaVinculacion: 'desc' }
    });
  }

  async vincular(procesoId, data, userId) {
    const proceso = await prisma.procesoVinculacion.findFirst({
      where: { id: procesoId, deletedAt: null }
    });

    if (!proceso) {
      throw new NotFoundError('Proceso');
    }

    if (proceso.tipoActivo !== 'PATENTE') {
      throw new ValidationError('Solo procesos tipo PATENTE pueden vincular empresas');
    }

    const empresa = await prisma.empresa.findFirst({
      where: { id: data.empresaId, deletedAt: null }
    });

    if (!empresa) {
      throw new NotFoundError('Empresa');
    }

    const existing = await prisma.procesoEmpresa.findFirst({
      where: { procesoId, empresaId: data.empresaId, deletedAt: null }
    });

    if (existing) {
      throw new ConflictError('La empresa ya está vinculada a este proceso');
    }

    const vinculacion = await prisma.procesoEmpresa.create({
      data: {
        procesoId,
        empresaId: data.empresaId,
        rolEmpresa: data.rolEmpresa,
        canalVinculacion: data.canalVinculacion,
        interesConfirmado: data.interesConfirmado || false,
        observaciones: data.observaciones,
        estado: 'ACTIVA'
      }
    });

    await prisma.historialEmpresaProceso.create({
      data: {
        procesoId,
        empresaId: data.empresaId,
        accion: 'VINCULADA',
        rolAnterior: null,
        rolNuevo: data.rolEmpresa,
        motivo: 'Primera vinculación con la empresa',
        modificadoPor: userId
      }
    });

    await this.updateEmpresasVinculadasCounter(procesoId);

    return vinculacion;
  }

  async updateVinculacion(procesoId, vinculacionId, data, userId) {
    const vinculacion = await prisma.procesoEmpresa.findFirst({
      where: { id: vinculacionId, procesoId, deletedAt: null }
    });

    if (!vinculacion) {
      throw new NotFoundError('Vinculación');
    }

    const updated = await prisma.procesoEmpresa.update({
      where: { id: vinculacionId },
      data
    });

    if (data.rolEmpresa && data.rolEmpresa !== vinculacion.rolEmpresa) {
      await prisma.historialEmpresaProceso.create({
        data: {
          procesoId,
          empresaId: vinculacion.empresaId,
          accion: 'ROL_CAMBIADO',
          rolAnterior: vinculacion.rolEmpresa,
          rolNuevo: data.rolEmpresa,
          motivo: 'Cambio de rol de empresa',
          modificadoPor: userId
        }
      });
    }

    if (data.ndaFirmado && !vinculacion.ndaFirmado) {
      await prisma.historialEmpresaProceso.create({
        data: {
          procesoId,
          empresaId: vinculacion.empresaId,
          accion: 'NDA_FIRMADO',
          rolAnterior: vinculacion.rolEmpresa,
          rolNuevo: vinculacion.rolEmpresa,
          motivo: 'NDA firmado exitosamente',
          modificadoPor: userId
        }
      });
    }

    return updated;
  }

  async retirar(procesoId, vinculacionId, motivoRetiro, userId) {
    const vinculacion = await prisma.procesoEmpresa.findFirst({
      where: { id: vinculacionId, procesoId, deletedAt: null }
    });

    if (!vinculacion) {
      throw new NotFoundError('Vinculación');
    }

    const updated = await prisma.procesoEmpresa.update({
      where: { id: vinculacionId },
      data: {
        estado: 'RETIRADA',
        fechaRetiro: new Date(),
        motivoRetiro
      }
    });

    await prisma.historialEmpresaProceso.create({
      data: {
        procesoId,
        empresaId: vinculacion.empresaId,
        accion: 'RETIRADA',
        rolAnterior: vinculacion.rolEmpresa,
        rolNuevo: vinculacion.rolEmpresa,
        motivo: motivoRetiro,
        modificadoPor: userId
      }
    });

    await this.updateEmpresasVinculadasCounter(procesoId);

    return updated;
  }

  async reactivar(procesoId, vinculacionId, observaciones, userId) {
    const vinculacion = await prisma.procesoEmpresa.findFirst({
      where: { id: vinculacionId, procesoId, deletedAt: null }
    });

    if (!vinculacion) {
      throw new NotFoundError('Vinculación');
    }

    if (vinculacion.estado !== 'RETIRADA') {
      throw new ValidationError('Solo se pueden reactivar empresas retiradas');
    }

    const updated = await prisma.procesoEmpresa.update({
      where: { id: vinculacionId },
      data: {
        estado: 'ACTIVA',
        fechaRetiro: null,
        motivoRetiro: null,
        observaciones
      }
    });

    await prisma.historialEmpresaProceso.create({
      data: {
        procesoId,
        empresaId: vinculacion.empresaId,
        accion: 'REACTIVADA',
        rolAnterior: vinculacion.rolEmpresa,
        rolNuevo: vinculacion.rolEmpresa,
        motivo: observaciones || 'Empresa reactivada',
        modificadoPor: userId
      }
    });

    await this.updateEmpresasVinculadasCounter(procesoId);

    return updated;
  }

  // async updateEmpresasVinculadasCounter(procesoId) {
  //   const count = await prisma.procesoEmpresa.count({
  //     where: { procesoId, estado: 'ACTIVA', deletedAt: null }
  //   });

  //   await prisma.procesoVinculacion.update({
  //     where: { id: procesoId },
  //     data: { empresasVinculadas: count }
  //   });
  // }

  async updateEmpresasVinculadasCounter(procesoId) {
    await procesoService.updateEmpresasCounter(procesoId);
  }
}

export default new EmpresaService();