import procesoService from '../services/proceso.service.js';
import { successResponse } from '../utils/responses.js';

class ProcesoController {
  async list(req, res, next) {
    try {
      const result = await procesoService.list(req.validatedQuery);
      res.json({
        success: true,
        data: {
          procesos: result.items,
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
      const proceso = await procesoService.getById(parseInt(id));
      res.json(successResponse(proceso));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const proceso = await procesoService.create(req.validatedData, req.user.id);
      res.status(201).json(successResponse(proceso));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const proceso = await procesoService.update(parseInt(id), req.validatedData);
      res.json(successResponse(proceso));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.validatedParams;
      await procesoService.delete(parseInt(id));
      res.json(successResponse(null, 'Proceso archivado exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  async updateTRL(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { nuevoTRL, justificacion } = req.validatedData;
      const proceso = await procesoService.updateTRL(parseInt(id), nuevoTRL, justificacion, req.user.id);
      res.json(successResponse(proceso));
    } catch (error) {
      next(error);
    }
  }

  async assignUsuario(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { usuarioId, rolProceso } = req.validatedData;
      const result = await procesoService.assignUsuario(parseInt(id), usuarioId, rolProceso);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async removeUsuario(req, res, next) {
    try {
      const { id, usuarioId } = req.params;
      await procesoService.removeUsuario(parseInt(id), parseInt(usuarioId));
      res.json(successResponse(null, 'Usuario removido del proceso'));
    } catch (error) {
      next(error);
    }
  }
}

export default new ProcesoController();