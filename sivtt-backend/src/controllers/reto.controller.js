import retoService from '../services/reto.service.js';
import { successResponse } from '../utils/responses.js';

class RetoController {
  async getByProceso(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const reto = await retoService.getByProceso(parseInt(procesoId));
      res.json(successResponse(reto));
    } catch (error) {
      next(error);
    }
  }

  async listConvocatorias(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const convocatorias = await retoService.listConvocatorias(parseInt(id));

      res.json({
        success: true,
        data: convocatorias
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const reto = await retoService.create(parseInt(procesoId), req.validatedData);
      res.status(201).json(successResponse(reto));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const reto = await retoService.update(parseInt(id), req.validatedData);
      res.json(successResponse(reto));
    } catch (error) {
      next(error);
    }
  }
}

export default new RetoController();