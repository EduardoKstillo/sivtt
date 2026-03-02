import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { authenticate, requireSystemPermission } from '../middlewares/auth.js';
import { validateQuery } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { analyticsQuerySchema } from '../validators/analytics.validator.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// 🚀 APLICAMOS EL PERMISO A TODO EL ARCHIVO:
// Solo los usuarios con 'ver:dashboard' o 'ver:todo' pueden ver estas métricas
router.use(requireSystemPermission('ver:dashboard', 'ver:todo'));

// KPIs generales
router.get('/kpis', asyncHandler(analyticsController.getKPIs));

// Procesos por estado y fase
router.get('/procesos-por-estado', validateQuery(analyticsQuerySchema), asyncHandler(analyticsController.getProcesosPorEstado));
router.get('/procesos-por-fase', validateQuery(analyticsQuerySchema), asyncHandler(analyticsController.getProcesosPorFase));

// Distribución y actividades
router.get('/trl-distribution', asyncHandler(analyticsController.getTRLDistribution));
router.get('/actividades-por-estado', validateQuery(analyticsQuerySchema), asyncHandler(analyticsController.getActividadesPorEstado));

// Timelines y Tops
router.get('/timeline', validateQuery(analyticsQuerySchema), asyncHandler(analyticsController.getTimeline));
router.get('/top-empresas', validateQuery(analyticsQuerySchema), asyncHandler(analyticsController.getTopEmpresas));
router.get('/recent-activity', validateQuery(analyticsQuerySchema), asyncHandler(analyticsController.getRecentActivity));
router.get('/metricas-por-tipo', asyncHandler(analyticsController.getMetricasPorTipo));

export default router;