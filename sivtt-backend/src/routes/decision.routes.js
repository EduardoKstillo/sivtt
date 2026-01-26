import { Router } from 'express';
import decisionController from '../controllers/decision.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createDecisionSchema, listDecisionesQuerySchema, procesoFaseParamsSchema } from '../validators/decision.validator.js';
import { procesoIdParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/procesos/:procesoId/decisiones', validateParams(procesoIdParamSchema), validateQuery(listDecisionesQuerySchema), asyncHandler(decisionController.listByProceso));

router.post('/procesos/:procesoId/fases/:faseId/decisiones', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(procesoFaseParamsSchema), validate(createDecisionSchema), asyncHandler(decisionController.create));

export default router;