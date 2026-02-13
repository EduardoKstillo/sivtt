import { Router } from 'express';
import postulacionController from '../controllers/postulacion.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createPostulacionSchema,
  evaluarPostulacionSchema,
  rechazarPostulacionSchema,
  listPostulacionesQuerySchema
} from '../validators/postulacion.validator.js';
import { idParamSchema, convocatoriaIdParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/convocatorias/:convocatoriaId/postulaciones', validateParams(convocatoriaIdParamSchema), validateQuery(listPostulacionesQuerySchema), asyncHandler(postulacionController.listByConvocatoria));

router.get('/:id', validateParams(idParamSchema), asyncHandler(postulacionController.getById));

router.post('/retos/:retoId/postulaciones', validate(createPostulacionSchema), asyncHandler(postulacionController.create));

router.patch('/:id/evaluar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'EVALUADOR'), validateParams(idParamSchema), validate(evaluarPostulacionSchema), asyncHandler(postulacionController.evaluar));

router.patch('/:id/seleccionar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), asyncHandler(postulacionController.seleccionar));

router.patch('/:id/rechazar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(rechazarPostulacionSchema), asyncHandler(postulacionController.rechazar));

export default router;