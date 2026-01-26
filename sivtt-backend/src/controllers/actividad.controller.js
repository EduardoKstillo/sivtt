import actividadService from '../services/actividad.service.js';
import { successResponse } from '../utils/responses.js';

class ActividadController {
  async listByProceso(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const result = await actividadService.listByProceso(parseInt(procesoId), req.validatedQuery);
      res.json({
        success: true,
        data: {
          actividades: result.items,
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
      const actividad = await actividadService.getById(parseInt(id));
      res.json(successResponse(actividad));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const actividad = await actividadService.create(parseInt(procesoId), req.validatedData, req.user.id);
      res.status(201).json(successResponse(actividad));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const actividad = await actividadService.update(parseInt(id), req.validatedData);
      res.json(successResponse(actividad));
    } catch (error) {
      next(error);
    }
  }

  async changeEstado(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { nuevoEstado, observaciones } = req.validatedData;
      const actividad = await actividadService.changeEstado(parseInt(id), nuevoEstado, observaciones, req.user.id);
      res.json(successResponse(actividad));
    } catch (error) {
      next(error);
    }
  }

  async aprobar(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const actividad = await actividadService.aprobar(parseInt(id), req.user.id);

      res.json(successResponse(actividad));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.validatedParams;
      await actividadService.delete(parseInt(id));
      res.json(successResponse(null, 'Actividad eliminada exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  async assignUsuario(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { usuarioId, rol } = req.validatedData;
      const result = await actividadService.assignUsuario(parseInt(id), usuarioId, rol);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async removeUsuario(req, res, next) {
    try {
      const { id, usuarioId } = req.params;
      await actividadService.removeUsuario(parseInt(id), parseInt(usuarioId));
      res.json(successResponse(null, 'Usuario removido de la actividad'));
    } catch (error) {
      next(error);
    }
  }
}

export default new ActividadController();