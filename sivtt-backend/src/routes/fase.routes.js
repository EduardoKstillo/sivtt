// ============================================================
// fase.routes.js
// ============================================================
import { Router } from 'express';
import faseController from '../controllers/fase.controller.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { validate, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { updateFaseSchema, closeFaseSchema } from '../validators/fase.validator.js';
import { procesoIdParamSchema, idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

// Lectura — cualquier usuario con permiso de ver proceso
router.get(
  '/procesos/:procesoId/fases',
  requirePermission('ver:proceso'),
  validateParams(procesoIdParamSchema),
  asyncHandler(faseController.listByProceso)
);

router.get(
  '/procesos/:procesoId/fases/:fase',
  requirePermission('ver:proceso'),
  asyncHandler(faseController.getByFase)
);

// Edición — requiere permiso de edición de proceso
router.patch(
  '/:id',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(updateFaseSchema),
  asyncHandler(faseController.update)
);

// Cierre — requiere permiso de edición de proceso
router.post(
  '/:id/cerrar',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(closeFaseSchema),
  asyncHandler(faseController.close)
);

export default router;