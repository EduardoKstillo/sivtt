import historialService from '../services/historial.service.js';
import { successResponse } from '../utils/responses.js';

class HistorialController {
  async getHistorialCompleto(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const result = await historialService.getHistorialCompleto(parseInt(procesoId), req.query);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getHistorialTRL(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const historial = await historialService.getHistorialTRL(parseInt(procesoId));
      res.json(successResponse(historial));
    } catch (error) {
      next(error);
    }
  }

  async getHistorialEstados(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const historial = await historialService.getHistorialEstados(parseInt(procesoId));
      res.json(successResponse(historial));
    } catch (error) {
      next(error);
    }
  }

  async getHistorialFases(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const historial = await historialService.getHistorialFases(parseInt(procesoId));
      res.json(successResponse(historial));
    } catch (error) {
      next(error);
    }
  }

  async getHistorialEmpresas(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const historial = await historialService.getHistorialEmpresas(parseInt(procesoId));
      res.json(successResponse(historial));
    } catch (error) {
      next(error);
    }
  }
}

export default new HistorialController();