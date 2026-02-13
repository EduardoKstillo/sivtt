import { Router } from 'express';
import retoController from '../controllers/reto.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createRetoSchema, updateRetoSchema } from '../validators/reto.validator.js';
import { procesoIdParamSchema, idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/:id/convocatorias', validateParams(idParamSchema), asyncHandler(retoController.listConvocatorias));

export default router;