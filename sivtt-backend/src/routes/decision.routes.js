import { Router } from 'express';
import decisionController from '../controllers/decision.controller.js';
// Cambiamos a requireProcesoPermission
import { authenticate, requireProcesoPermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createDecisionSchema,
  listDecisionesQuerySchema,
  procesoFaseParamsSchema
} from '../validators/decision.validator.js';
import { procesoIdParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

// Lectura — accesible a quien pueda ver el proceso
router.get(
  '/procesos/:procesoId/decisiones',
  requireProcesoPermission('ver:proceso'), // Usa el guardián de proceso
  validateParams(procesoIdParamSchema),
  validateQuery(listDecisionesQuerySchema),
  asyncHandler(decisionController.listByProceso)
);

// Crear decisión — requiere permiso de edición de proceso
router.post(
  '/procesos/:procesoId/fases/:faseId/decisiones',
  requireProcesoPermission('editar:proceso'), // Usa el guardián de proceso
  validateParams(procesoFaseParamsSchema),
  validate(createDecisionSchema),
  asyncHandler(decisionController.create)
);

export default router;