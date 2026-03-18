import { Router } from 'express';
import faseController from '../controllers/fase.controller.js';
import { authenticate, requireProcesoPermission, requireFasePermission, requireActiveProceso } from '../middlewares/auth.js';
import { validate, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { updateFaseSchema, closeFaseSchema } from '../validators/fase.validator.js';
import { procesoIdParamSchema, idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

// Lectura — cualquier usuario con permiso de ver proceso
router.get(
  '/procesos/:procesoId/fases',
  requireProcesoPermission('ver:proceso'),
  validateParams(procesoIdParamSchema),
  asyncHandler(faseController.listByProceso)
);

router.get(
  '/procesos/:procesoId/fases/:fase',
  requireProcesoPermission('ver:proceso'),
  asyncHandler(faseController.getByFase)
);

// Edición — requiere permiso de edición de proceso (validado mediante el ID de la fase)
router.patch(
  '/:id',
  requireFasePermission('editar:proceso'),
  requireActiveProceso,
  validateParams(idParamSchema),
  validate(updateFaseSchema),
  asyncHandler(faseController.update)
);

export default router;