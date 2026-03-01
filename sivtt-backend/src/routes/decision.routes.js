import { Router } from 'express';
import decisionController from '../controllers/decision.controller.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
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
  requirePermission('ver:proceso'),
  validateParams(procesoIdParamSchema),
  validateQuery(listDecisionesQuerySchema),
  asyncHandler(decisionController.listByProceso)
);

// Crear decisión — requiere permiso de edición de proceso
router.post(
  '/procesos/:procesoId/fases/:faseId/decisiones',
  requirePermission('editar:proceso'),
  validateParams(procesoFaseParamsSchema),
  validate(createDecisionSchema),
  asyncHandler(decisionController.create)
);

export default router;