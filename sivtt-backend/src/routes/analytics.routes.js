import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validateQuery } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { analyticsQuerySchema } from '../validators/analytics.validator.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// KPIs generales
router.get(
  '/kpis',
  asyncHandler(analyticsController.getKPIs)
);

// Procesos por estado
router.get(
  '/procesos-por-estado',
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getProcesosPorEstado)
);

// Procesos por fase
router.get(
  '/procesos-por-fase',
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getProcesosPorFase)
);

// Distribución TRL
router.get(
  '/trl-distribution',
  asyncHandler(analyticsController.getTRLDistribution)
);

// Actividades por estado
router.get(
  '/actividades-por-estado',
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getActividadesPorEstado)
);

// Timeline
router.get(
  '/timeline',
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getTimeline)
);

// Top empresas
router.get(
  '/top-empresas',
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getTopEmpresas)
);

// Actividad reciente
router.get(
  '/recent-activity',
  validateQuery(analyticsQuerySchema),
  asyncHandler(analyticsController.getRecentActivity)
);

// Métricas por tipo
router.get(
  '/metricas-por-tipo',
  asyncHandler(analyticsController.getMetricasPorTipo)
);

export default router;