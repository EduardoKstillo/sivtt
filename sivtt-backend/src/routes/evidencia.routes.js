// ============================================================
// evidencia.routes.js
// ============================================================
import { Router } from 'express';
import evidenciaController from '../controllers/evidencia.controller.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createEvidenciaSchema,
  reviewEvidenciaSchema,
  listEvidenciasQuerySchema
} from '../validators/evidencia.validator.js';
import { procesoIdParamSchema, idParamSchema, actividadIdParamSchema } from '../validators/common.validator.js';
import { uploadEvidencia } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate);

// Listado de evidencias por proceso
router.get(
  '/procesos/:procesoId/evidencias',
  requirePermission('ver:proceso', 'ver:actividad'),
  validateParams(procesoIdParamSchema),
  validateQuery(listEvidenciasQuerySchema),
  asyncHandler(evidenciaController.listByProceso)
);

// Detalle de una evidencia
router.get(
  '/:id',
  requirePermission('ver:actividad', 'ver:proceso'),
  validateParams(idParamSchema),
  asyncHandler(evidenciaController.getById)
);

// Subir evidencia — el service valida internamente que sea el RESPONSABLE_TAREA
// requirePermission solo verifica que el usuario tenga el permiso a nivel de sistema/proceso
router.post(
  '/actividades/:actividadId/evidencias',
  requirePermission('subir:evidencia'),
  validateParams(actividadIdParamSchema),
  uploadEvidencia.single('archivo'),
  validate(createEvidenciaSchema),
  asyncHandler(evidenciaController.create)
);

// Revisar (aprobar/rechazar) una evidencia — el service valida que sea REVISOR_TAREA
router.patch(
  '/:id/revisar',
  requirePermission('aprobar:evidencia', 'rechazar:evidencia'),
  validateParams(idParamSchema),
  validate(reviewEvidenciaSchema),
  asyncHandler(evidenciaController.review)
);

// Eliminar evidencia (solo si está PENDIENTE)
router.delete(
  '/:id',
  requirePermission('subir:evidencia', 'editar:actividad'),
  validateParams(idParamSchema),
  asyncHandler(evidenciaController.delete)
);

export default router;