import authService from '../services/auth.service.js';
import { successResponse } from '../utils/responses.js';

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.validatedData;
      const result = await authService.login(email, password);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.validatedData;
      const result = await authService.refresh(refreshToken);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.validatedData;
      await authService.logout(refreshToken);
      res.json(successResponse(null, 'Sesión cerrada exitosamente'));
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();