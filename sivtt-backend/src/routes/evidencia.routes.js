import { Router } from 'express';
import evidenciaController from '../controllers/evidencia.controller.js';
import { authenticate, requireProcesoPermission, requireActividadPermission, requireEvidenciaPermission, requireActiveProceso } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createEvidenciaSchema, reviewEvidenciaSchema, listEvidenciasQuerySchema } from '../validators/evidencia.validator.js';
import { procesoIdParamSchema, idParamSchema, actividadIdParamSchema } from '../validators/common.validator.js';
import { uploadEvidencia } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate);

// Listado de evidencias por proceso
router.get(
  '/procesos/:procesoId/evidencias',
  requireProcesoPermission('ver:proceso'),
  validateParams(procesoIdParamSchema),
  validateQuery(listEvidenciasQuerySchema),
  asyncHandler(evidenciaController.listByProceso)
);

// Detalle de una evidencia (Si pasas solo el ID de la evidencia)
router.get(
  '/:id',
  requireEvidenciaPermission('ver:actividad'), // Validamos usando la herencia Evidencia -> Actividad
  validateParams(idParamSchema),
  asyncHandler(evidenciaController.getById)
);

// Subir evidencia (Usamos requireActividadPermission porque en la URL viene el :actividadId)
router.post(
  '/actividades/:actividadId/evidencias',
  requireActividadPermission('subir:evidencia'),
  requireActiveProceso,
  validateParams(actividadIdParamSchema),
  uploadEvidencia.single('archivo'),
  validate(createEvidenciaSchema),
  asyncHandler(evidenciaController.create)
);

// Revisar (aprobar/rechazar) una evidencia
router.patch(
  '/:id/revisar',
  requireEvidenciaPermission('aprobar:evidencia', 'rechazar:evidencia'),
  requireActiveProceso,
  validateParams(idParamSchema),
  validate(reviewEvidenciaSchema),
  asyncHandler(evidenciaController.review)
);

// Eliminar evidencia
router.delete(
  '/:id',
  requireEvidenciaPermission('subir:evidencia', 'editar:actividad'),
  requireActiveProceso,
  validateParams(idParamSchema),
  asyncHandler(evidenciaController.delete)
);

export default router;