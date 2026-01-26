import prisma from '../config/database.js';
import { successResponse } from '../utils/responses.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { getPagination, buildPaginatedResponse } from '../utils/pagination.js';

class FinanciamientoController {
  async listByProceso(req, res, next) {
    try {
      const { procesoId } = req.params;
      const { skip, take, page, limit } = getPagination(req.query.page, req.query.limit);

      const where = {
        procesoId: parseInt(procesoId),
        deletedAt: null
      };

      if (req.query.tipoFinanciamiento) where.tipoFinanciamiento = req.query.tipoFinanciamiento;
      if (req.query.estadoGestion) where.estadoGestion = req.query.estadoGestion;

      const [financiamientos, total] = await Promise.all([
        prisma.financiamiento.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.financiamiento.count({ where })
      ]);

      const resumen = await prisma.financiamiento.aggregate({
        where,
        _sum: {
          monto: true,
          capex: true,
          opex: true
        }
      });

      const aprobado = await prisma.financiamiento.aggregate({
        where: { ...where, estadoGestion: 'APROBADO' },
        _sum: { monto: true }
      });

      const enTramite = await prisma.financiamiento.aggregate({
        where: { ...where, estadoGestion: 'EN_TRAMITE' },
        _sum: { monto: true }
      });

      const desembolsado = await prisma.financiamiento.aggregate({
        where: { ...where, estadoGestion: 'DESEMBOLSADO' },
        _sum: { monto: true }
      });

      res.json({
        success: true,
        data: {
          financiamientos,
          resumen: {
            totalMonto: resumen._sum.monto || 0,
            totalCapex: resumen._sum.capex || 0,
            totalOpex: resumen._sum.opex || 0,
            aprobado: aprobado._sum.monto || 0,
            enTramite: enTramite._sum.monto || 0,
            desembolsado: desembolsado._sum.monto || 0
          },
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      
      const financiamiento = await prisma.financiamiento.findFirst({
        where: { id: parseInt(id), deletedAt: null },
        include: {
          proceso: {
            select: {
              codigo: true,
              titulo: true
            }
          }
        }
      });

      if (!financiamiento) {
        throw new NotFoundError('Financiamiento');
      }

      res.json(successResponse(financiamiento));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { procesoId } = req.params;

      const proceso = await prisma.procesoVinculacion.findFirst({
        where: { id: parseInt(procesoId), deletedAt: null }
      });

      if (!proceso) {
        throw new NotFoundError('Proceso');
      }

      const financiamiento = await prisma.financiamiento.create({
        data: {
          procesoId: parseInt(procesoId),
          ...req.body
        }
      });

      res.status(201).json(successResponse(financiamiento));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;

      const financiamiento = await prisma.financiamiento.findFirst({
        where: { id: parseInt(id), deletedAt: null }
      });

      if (!financiamiento) {
        throw new NotFoundError('Financiamiento');
      }

      const updated = await prisma.financiamiento.update({
        where: { id: parseInt(id) },
        data: req.body
      });

      res.json(successResponse(updated));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const financiamiento = await prisma.financiamiento.findFirst({
        where: { id: parseInt(id), deletedAt: null }
      });

      if (!financiamiento) {
        throw new NotFoundError('Financiamiento');
      }

      await prisma.financiamiento.update({
        where: { id: parseInt(id) },
        data: { deletedAt: new Date() }
      });

      res.json(successResponse(null, 'Financiamiento eliminado exitosamente'));
    } catch (error) {
      next(error);
    }
  }
}

export default new FinanciamientoController();