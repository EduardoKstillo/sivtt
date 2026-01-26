import decisionService from '../services/decision.service.js';
import { successResponse } from '../utils/responses.js';

class DecisionController {
  async listByProceso(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const result = await decisionService.listByProceso(parseInt(procesoId), req.validatedQuery);
      res.json({
        success: true,
        data: {
          decisiones: result.items,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { procesoId, faseId } = req.validatedParams;
      const data = req.validatedData;

      // 🔥 Para RELANZAR_CONVOCATORIA, pasar datos adicionales
      let decision;
      if (data.decision === 'RELANZAR_CONVOCATORIA') {
        decision = await decisionService.create(
          parseInt(procesoId),
          parseInt(faseId),
          data,
          req.user.id,
          {
            fechaApertura: data.fechaApertura,
            fechaCierre: data.fechaCierre,
            modificaciones: data.modificaciones
          }
        );
      } else {
        decision = await decisionService.create(
          parseInt(procesoId),
          parseInt(faseId),
          data,
          req.user.id
        );
      }

      res.status(201).json(successResponse(decision));
    } catch (error) {
      next(error);
    }
  }
}

export default new DecisionController();