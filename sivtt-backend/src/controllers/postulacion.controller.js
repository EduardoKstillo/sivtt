import postulacionService from '../services/postulacion.service.js';
import { successResponse } from '../utils/responses.js';

class PostulacionController {
  async listByConvocatoria(req, res, next) {
    try {
      const { convocatoriaId } = req.validatedParams;
      const result = await postulacionService.listByConvocatoria(parseInt(convocatoriaId), req.validatedQuery);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const postulacion = await postulacionService.getById(parseInt(id));
      res.json(successResponse(postulacion));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { retoId } = req.validatedParams;
      const postulacion = await postulacionService.create(parseInt(retoId), req.validatedData);
      res.status(201).json(successResponse(postulacion));
    } catch (error) {
      next(error);
    }
  }

  async evaluar(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const postulacion = await postulacionService.evaluar(parseInt(id), req.validatedData);
      res.json(successResponse(postulacion));
    } catch (error) {
      next(error);
    }
  }

  async seleccionar(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const postulacion = await postulacionService.seleccionar(parseInt(id));
      res.json(successResponse(postulacion));
    } catch (error) {
      next(error);
    }
  }

  async rechazar(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { motivoRechazo } = req.validatedData;
      const postulacion = await postulacionService.rechazar(parseInt(id), motivoRechazo);
      res.json(successResponse(postulacion));
    } catch (error) {
      next(error);
    }
  }
}

export default new PostulacionController();