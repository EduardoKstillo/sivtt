import { Router } from 'express';
import evidenciaController from '../controllers/evidencia.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createEvidenciaSchema,
  reviewEvidenciaSchema,
  listEvidenciasQuerySchema
} from '../validators/evidencia.validator.js';
import { procesoIdParamSchema, idParamSchema, actividadIdParamSchema  } from '../validators/common.validator.js';
import { uploadEvidencia } from '../middlewares/upload.js';

const router = Router();

router.use(authenticate);

router.get('/procesos/:procesoId/evidencias', validateParams(procesoIdParamSchema), validateQuery(listEvidenciasQuerySchema), asyncHandler(evidenciaController.listByProceso));

router.get('/:id', validateParams(idParamSchema), asyncHandler(evidenciaController.getById));

router.post('/actividades/:actividadId/evidencias', validateParams(actividadIdParamSchema), uploadEvidencia.single('archivo'), validate(createEvidenciaSchema), asyncHandler(evidenciaController.create));

router.patch('/:id/revisar', authorize('REVISOR', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(reviewEvidenciaSchema), asyncHandler(evidenciaController.review));

router.delete('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), asyncHandler(evidenciaController.delete));

export default router;