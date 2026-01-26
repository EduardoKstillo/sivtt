import evidenciaService from '../services/evidencia.service.js';
import { successResponse } from '../utils/responses.js';

class EvidenciaController {
  async listByProceso(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const result = await evidenciaService.listByProceso(parseInt(procesoId), req.validatedQuery);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const evidencia = await evidenciaService.getById(parseInt(id));
      res.json(successResponse(evidencia));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { actividadId } = req.validatedParams;
      
      const data = {
        tipoEvidencia: req.validatedData.tipoEvidencia,
        nombreArchivo: req.file?.originalname || 'archivo',
        urlArchivo: req.file?.path || 'https://storage.example.com/temp',
        tamaño: req.file?.size,
        descripcion: req.validatedData.descripcion
      };

      const evidencia = await evidenciaService.create(parseInt(actividadId), data, req.user.id);
      res.status(201).json(successResponse(evidencia));
    } catch (error) {
      next(error);
    }
  }

  async review(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { nuevoEstado, comentarioRevision } = req.validatedData;
      const evidencia = await evidenciaService.review(parseInt(id), nuevoEstado, comentarioRevision, req.user.id);
      res.json(successResponse(evidencia));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.validatedParams;
      await evidenciaService.delete(parseInt(id));
      res.json(successResponse(null, 'Evidencia eliminada exitosamente'));
    } catch (error) {
      next(error);
    }
  }
}

export default new EvidenciaController();