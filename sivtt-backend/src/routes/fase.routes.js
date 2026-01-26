import { Router } from 'express';
import faseController from '../controllers/fase.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { updateFaseSchema, closeFaseSchema } from '../validators/fase.validator.js';
import { procesoIdParamSchema, idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/procesos/:procesoId/fases', validateParams(procesoIdParamSchema), asyncHandler(faseController.listByProceso));

router.get('/procesos/:procesoId/fases/:fase', asyncHandler(faseController.getByFase));

router.patch('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'), validateParams(idParamSchema), validate(updateFaseSchema), asyncHandler(faseController.update));

router.post('/:id/cerrar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(closeFaseSchema), asyncHandler(faseController.close));

export default router;