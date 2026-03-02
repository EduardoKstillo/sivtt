import analyticsService from '../services/analytics.service.js';
import { successResponse } from '../utils/responses.js';

class AnalyticsController {
  async getKPIs(req, res, next) {
    try {
      const kpis = await analyticsService.getKPIs();
      res.json(successResponse(kpis));
    } catch (error) {
      next(error);
    }
  }

  async getProcesosPorEstado(req, res, next) {
    try {
      const data = await analyticsService.getProcesosPorEstado(req.query);
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  async getProcesosPorFase(req, res, next) {
    try {
      const data = await analyticsService.getProcesosPorFase(req.query);
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  async getTRLDistribution(req, res, next) {
    try {
      const data = await analyticsService.getTRLDistribution();
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  async getActividadesPorEstado(req, res, next) {
    try {
      const data = await analyticsService.getActividadesPorEstado(req.query);
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  async getTimeline(req, res, next) {
    try {
      const data = await analyticsService.getTimeline(req.query);
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  async getTopEmpresas(req, res, next) {
    try {
      const data = await analyticsService.getTopEmpresas(req.query);
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req, res, next) {
    try {
      const data = await analyticsService.getRecentActivity(req.query);
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }

  async getMetricasPorTipo(req, res, next) {
    try {
      const data = await analyticsService.getMetricasPorTipo();
      res.json(successResponse(data));
    } catch (error) {
      next(error);
    }
  }
}

export default new AnalyticsController();