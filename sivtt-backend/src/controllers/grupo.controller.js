import grupoService from '../services/grupo.service.js';
import { successResponse } from '../utils/responses.js';

class GrupoController {
  async list(req, res, next) {
    try {
      const result = await grupoService.list(req.validatedQuery);
      res.json({
        success: true,
        data: {
          grupos: result.items,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async listPostulaciones(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const result = await grupoService.listPostulaciones(parseInt(id), req.validatedQuery);

      res.json({
        success: true,
        data: {
          postulaciones: result.items,
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
      const grupo = await grupoService.getById(parseInt(id));
      res.json(successResponse(grupo));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const grupo = await grupoService.create(req.validatedData);
      res.status(201).json(successResponse(grupo));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const grupo = await grupoService.update(parseInt(id), req.validatedData);
      res.json(successResponse(grupo));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.validatedParams;
      await grupoService.delete(parseInt(id));
      res.json(successResponse(null, 'Grupo eliminado exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  async addMiembro(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const miembro = await grupoService.addMiembro(parseInt(id), req.validatedData);
      res.status(201).json(successResponse(miembro));
    } catch (error) {
      next(error);
    }
  }

  async removeMiembro(req, res, next) {
    try {
      const { id, miembroId } = req.params;
      await grupoService.removeMiembro(parseInt(id), parseInt(miembroId));
      res.json(successResponse(null, 'Miembro removido del grupo'));
    } catch (error) {
      next(error);
    }
  }
}

export default new GrupoController();