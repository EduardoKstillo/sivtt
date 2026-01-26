// controllers/reunion.controller.js
import reunionService from '../services/reunion.service.js';
import { successResponse } from '../utils/responses.js';

class ReunionController {
  async listByProceso(req, res, next) {
    try {
      const { procesoId } = req.params;
      const result = await reunionService.listByProceso(parseInt(procesoId), req.query);
      
      res.json({
        success: true,
        data: {
          reuniones: result.items,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const reunion = await reunionService.getById(parseInt(req.params.id));
      res.json(successResponse(reunion));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { actividadId } = req.params;
      const reunion = await reunionService.create(parseInt(actividadId), req.validatedData);
      res.status(201).json(successResponse(reunion));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const updated = await reunionService.update(parseInt(req.params.id), req.validatedData);
      res.json(successResponse(updated));
    } catch (error) {
      next(error);
    }
  }

  async completar(req, res, next) {
    try {
      const updated = await reunionService.completar(parseInt(req.params.id), req.validatedData);
      res.json(successResponse(updated));
    } catch (error) {
      next(error);
    }
  }

  async addParticipante(req, res, next) {
    try {
      const { id } = req.params;
      const participante = await reunionService.addParticipante(parseInt(id), req.validatedData);
      res.status(201).json(successResponse(participante));
    } catch (error) {
      next(error);
    }
  }

  async removeParticipante(req, res, next) {
    try {
      const { id, participanteId } = req.params;
      await reunionService.removeParticipante(parseInt(id), parseInt(participanteId));
      res.json(successResponse(null, 'Participante removido de la reunión'));
    } catch (error) {
      next(error);
    }
  }
}

export default new ReunionController();