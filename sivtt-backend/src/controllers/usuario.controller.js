import usuarioService from '../services/usuario.service.js';
import { successResponse } from '../utils/responses.js';

class UsuarioController {
  async list(req, res, next) {
    try {
      const result = await usuarioService.list(req.validatedQuery);
      res.json({
        success: true,
        data: {
          usuarios: result.items,
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
      const usuario = await usuarioService.getById(parseInt(id));
      res.json(successResponse(usuario));
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const usuario = await usuarioService.create(req.validatedData);
      res.status(201).json(successResponse(usuario));
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const usuario = await usuarioService.update(parseInt(id), req.validatedData);
      res.json(successResponse(usuario));
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { passwordActual, passwordNueva } = req.validatedData;
      await usuarioService.changePassword(parseInt(id), passwordActual, passwordNueva);
      res.json(successResponse(null, 'Contraseña actualizada exitosamente'));
    } catch (error) {
      next(error);
    }
  }

  async toggleEstado(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { activo } = req.validatedData;
      const usuario = await usuarioService.toggleEstado(parseInt(id), activo);
      res.json(successResponse(usuario));
    } catch (error) {
      next(error);
    }
  }

  async assignRol(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { rolId } = req.validatedData;
      const result = await usuarioService.assignRol(parseInt(id), rolId);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async removeRol(req, res, next) {
    try {
      const { id, rolId } = req.params;
      await usuarioService.removeRol(parseInt(id), parseInt(rolId));
      res.json(successResponse(null, 'Rol removido del usuario'));
    } catch (error) {
      next(error);
    }
  }

  async listRoles(req, res, next) {
    try {
      const roles = await usuarioService.listRoles();
      res.json(successResponse(roles));
    } catch (error) {
      next(error);
    }
  }
}

export default new UsuarioController();