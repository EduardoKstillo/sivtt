import { Router } from 'express';
import convocatoriaController from '../controllers/convocatoria.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createConvocatoriaSchema,
  updateConvocatoriaSchema,
  relanzarConvocatoriaSchema,
  listConvocatoriasQuerySchema
} from '../validators/convocatoria.validator.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listConvocatoriasQuerySchema), asyncHandler(convocatoriaController.list));
router.get('/:id', validateParams(idParamSchema), asyncHandler(convocatoriaController.getById));

router.post('/retos/:retoId/convocatorias', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validate(createConvocatoriaSchema), asyncHandler(convocatoriaController.create));

router.patch('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(updateConvocatoriaSchema), asyncHandler(convocatoriaController.update));

router.patch('/:id/publicar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), asyncHandler(convocatoriaController.publicar));

router.patch('/:id/cerrar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), asyncHandler(convocatoriaController.cerrar));

router.post('/:id/relanzar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(relanzarConvocatoriaSchema), asyncHandler(convocatoriaController.relanzar));

export default router;