import { Router } from 'express';
import retoController from '../controllers/reto.controller.js';
import { authenticate, requireSystemPermission } from '../middlewares/auth.js';
import { validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

// Listar convocatorias de un reto (Lectura global)
router.get(
  '/:id/convocatorias',
  requireSystemPermission('ver:convocatorias', 'ver:proceso'),
  validateParams(idParamSchema),
  asyncHandler(retoController.listConvocatorias)
);

export default router;