import rolService from '../services/rol.service.js';
import { successResponse } from '../utils/responses.js';

class RolController {
  // ==========================================
  // ROLES
  // ==========================================

  async listRoles(req, res, next) {
    try {
      const roles = await rolService.listRoles(req.query);
      res.json(successResponse(roles));
    } catch (error) {
      next(error);
    }
  }

  async getRolById(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const rol = await rolService.getRolById(parseInt(id));
      res.json(successResponse(rol));
    } catch (error) {
      next(error);
    }
  }

  async createRol(req, res, next) {
    try {
      const rol = await rolService.createRol(req.validatedData);
      res.status(201).json(successResponse(rol));
    } catch (error) {
      next(error);
    }
  }

  async updateRol(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const rol = await rolService.updateRol(parseInt(id), req.validatedData);
      res.json(successResponse(rol));
    } catch (error) {
      next(error);
    }
  }

  async toggleEstadoRol(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { activo } = req.validatedData;
      const rol = await rolService.toggleEstadoRol(parseInt(id), activo);
      res.json(successResponse(rol));
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PERMISOS
  // ==========================================

  async listPermisos(req, res, next) {
    try {
      const result = await rolService.listPermisos(req.query);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async createPermiso(req, res, next) {
    try {
      const permiso = await rolService.createPermiso(req.validatedData);
      res.status(201).json(successResponse(permiso));
    } catch (error) {
      next(error);
    }
  }

  async updatePermiso(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const permiso = await rolService.updatePermiso(parseInt(id), req.validatedData);
      res.json(successResponse(permiso));
    } catch (error) {
      next(error);
    }
  }

  async deletePermiso(req, res, next) {
    try {
      const { id } = req.validatedParams;
      await rolService.deletePermiso(parseInt(id));
      res.json(successResponse(null, 'Permiso eliminado'));
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ASIGNACIÓN PERMISOS ↔ ROLES
  // ==========================================

  async assignPermisos(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { permisoIds } = req.validatedData;
      const rol = await rolService.assignPermisosToRol(parseInt(id), permisoIds);
      res.json(successResponse(rol));
    } catch (error) {
      next(error);
    }
  }

  async removePermiso(req, res, next) {
    try {
      const { id, permisoId } = req.params;
      await rolService.removePermisoFromRol(parseInt(id), parseInt(permisoId));
      res.json(successResponse(null, 'Permiso removido del rol'));
    } catch (error) {
      next(error);
    }
  }

  async syncPermisos(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { permisoIds } = req.validatedData;
      const rol = await rolService.syncPermisosRol(parseInt(id), permisoIds);
      res.json(successResponse(rol));
    } catch (error) {
      next(error);
    }
  }
}

export default new RolController();