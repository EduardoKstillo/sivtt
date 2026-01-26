import empresaService from '../services/empresa.service.js';
import { successResponse } from '../utils/responses.js';

class EmpresaController {
  async list(req, res, next) {
    try {
      const result = await empresaService.list(req.validatedQuery);
      res.json({
        success: true,
        data: {
          empresas: result.items,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async listDisponibles(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const result = await empresaService.listDisponibles(parseInt(procesoId), req.validatedQuery);

      res.json({
        success: true,
        data: {
          empresas: result.items,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const empresa = await empresaService.getById(parseInt(id));
      res.json(successResponse(empresa));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const empresa = await empresaService.create(req.validatedData);
      res.status(201).json(successResponse(empresa));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const empresa = await empresaService.update(parseInt(id), req.validatedData);
      res.json(successResponse(empresa));
    } catch (error) {
      next(error);
    }
  }

  async verify(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { verificada } = req.validatedData;
      const empresa = await empresaService.verify(parseInt(id), verificada);
      res.json(successResponse(empresa));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.validatedParams;
      await empresaService.delete(parseInt(id));
      res.json(successResponse(null, 'Empresa eliminada exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  async listByProceso(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const empresas = await empresaService.listByProceso(parseInt(procesoId));
      res.json(successResponse(empresas));
    } catch (error) {
      next(error);
    }
  }

  async vincular(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const vinculacion = await empresaService.vincular(parseInt(procesoId), req.validatedData, req.user.id);
      res.status(201).json(successResponse(vinculacion));
    } catch (error) {
      next(error);
    }
  }

  async updateVinculacion(req, res, next) {
    try {
      const { procesoId, id } = req.validatedParams;
      const vinculacion = await empresaService.updateVinculacion(parseInt(procesoId), parseInt(id), req.validatedData, req.user.id);
      res.json(successResponse(vinculacion));
    } catch (error) {
      next(error);
    }
  }

  async retirar(req, res, next) {
    try {
      const { procesoId, id } = req.validatedParams;
      const { motivoRetiro } = req.validatedData;
      const vinculacion = await empresaService.retirar(parseInt(procesoId), parseInt(id), motivoRetiro, req.user.id);
      res.json(successResponse(vinculacion));
    } catch (error) {
      next(error);
    }
  }

  async reactivar(req, res, next) {
    try {
      const { procesoId, id } = req.validatedParams;
      const { observaciones } = req.validatedData;
      const vinculacion = await empresaService.reactivar(parseInt(procesoId), parseInt(id), observaciones, req.user.id);
      res.json(successResponse(vinculacion));
    } catch (error) {
      next(error);
    }
  }
}

export default new EmpresaController();