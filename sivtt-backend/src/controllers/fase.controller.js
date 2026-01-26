import faseService from '../services/fase.service.js';
import { successResponse } from '../utils/responses.js';

class FaseController {
  async listByProceso(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const fases = await faseService.listByProceso(parseInt(procesoId));
      res.json(successResponse(fases));
    } catch (error) {
      next(error);
    }
  }

  async getByFase(req, res, next) {
    try {
      const { procesoId, fase } = req.params;
      const result = await faseService.getByFase(parseInt(procesoId), fase);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const fase = await faseService.update(parseInt(id), req.validatedData);
      res.json(successResponse(fase));
    } catch (error) {
      next(error);
    }
  }

  async close(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { observaciones } = req.validatedData;
      const fase = await faseService.close(parseInt(id), observaciones, req.user.id);
      res.json(successResponse(fase));
    } catch (error) {
      next(error);
    }
  }
}

export default new FaseController();