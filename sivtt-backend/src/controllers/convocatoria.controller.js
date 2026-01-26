import convocatoriaService from '../services/convocatoria.service.js';
import { successResponse } from '../utils/responses.js';

class ConvocatoriaController {
  async list(req, res, next) {
    try {
      const result = await convocatoriaService.list(req.validatedQuery);
      res.json({
        success: true,
        data: {
          convocatorias: result.items,
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
      const convocatoria = await convocatoriaService.getById(parseInt(id));
      res.json(successResponse(convocatoria));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { retoId } = req.validatedParams;
      const convocatoria = await convocatoriaService.create(parseInt(retoId), req.validatedData);
      res.status(201).json(successResponse(convocatoria));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const convocatoria = await convocatoriaService.update(parseInt(id), req.validatedData);
      res.json(successResponse(convocatoria));
    } catch (error) {
      next(error);
    }
  }

  async publicar(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const convocatoria = await convocatoriaService.publicar(parseInt(id));
      res.json(successResponse(convocatoria));
    } catch (error) {
      next(error);
    }
  }

  async cerrar(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const convocatoria = await convocatoriaService.cerrar(parseInt(id));
      res.json(successResponse(convocatoria));
    } catch (error) {
      next(error);
    }
  }

  async relanzar(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const convocatoria = await convocatoriaService.relanzar(parseInt(id), req.validatedData);
      res.status(201).json(successResponse(convocatoria));
    } catch (error) {
      next(error);
    }
  }
}

export default new ConvocatoriaController();