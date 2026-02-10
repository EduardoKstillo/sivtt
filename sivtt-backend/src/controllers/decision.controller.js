import decisionService from '../services/decision.service.js';
import { successResponse } from '../utils/responses.js';

class DecisionController {
  async listByProceso(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const result = await decisionService.listByProceso(parseInt(procesoId), req.validatedQuery);
      // Usar helper standard
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res) { // Sin next, sin try/catch
    const { procesoId, faseId } = req.validatedParams;
    const data = req.validatedData;
    const decision = await decisionService.create(parseInt(procesoId), parseInt(faseId), data, req.user.id);
    res.status(201).json(successResponse(decision));
}
}

export default new DecisionController();