import { Router } from 'express';
import retoController from '../controllers/reto.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createRetoSchema, updateRetoSchema } from '../validators/reto.validator.js';
import { procesoIdParamSchema, idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/procesos/:procesoId/reto', validateParams(procesoIdParamSchema), asyncHandler(retoController.getByProceso));

router.get('/:id/convocatorias', validateParams(idParamSchema), asyncHandler(retoController.listConvocatorias));


router.post('/procesos/:procesoId/reto', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(procesoIdParamSchema), validate(createRetoSchema), asyncHandler(retoController.create));

router.patch('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(updateRetoSchema), asyncHandler(retoController.update));

export default router;