import { Router } from 'express';
import postulacionController from '../controllers/postulacion.controller.js';
import { authenticate, requireSystemPermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createPostulacionSchema, evaluarPostulacionSchema, rechazarPostulacionSchema,
  listPostulacionesQuerySchema
} from '../validators/postulacion.validator.js';
import { idParamSchema, convocatoriaIdParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/convocatorias/:convocatoriaId/postulaciones', requireSystemPermission('ver:convocatorias', 'ver:proceso'), validateParams(convocatoriaIdParamSchema), validateQuery(listPostulacionesQuerySchema), asyncHandler(postulacionController.listByConvocatoria));
router.get('/:id', requireSystemPermission('ver:convocatorias', 'ver:proceso'), validateParams(idParamSchema), asyncHandler(postulacionController.getById));
router.post('/retos/:retoId/postulaciones', requireSystemPermission('postular:convocatoria'), validate(createPostulacionSchema), asyncHandler(postulacionController.create));
router.patch('/:id/evaluar', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), validate(evaluarPostulacionSchema), asyncHandler(postulacionController.evaluar));
router.patch('/:id/seleccionar', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), asyncHandler(postulacionController.seleccionar));
router.patch('/:id/rechazar', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), validate(rechazarPostulacionSchema), asyncHandler(postulacionController.rechazar));

export default router;