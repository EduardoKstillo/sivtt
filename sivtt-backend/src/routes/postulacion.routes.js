import { Router } from 'express';
import postulacionController from '../controllers/postulacion.controller.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
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

// Listar postulaciones de una convocatoria
router.get(
  '/convocatorias/:convocatoriaId/postulaciones',
  requirePermission('ver:convocatorias', 'ver:proceso'),
  validateParams(convocatoriaIdParamSchema),
  validateQuery(listPostulacionesQuerySchema),
  asyncHandler(postulacionController.listByConvocatoria)
);

// Detalle de una postulación
router.get(
  '/:id',
  requirePermission('ver:convocatorias', 'ver:proceso'),
  validateParams(idParamSchema),
  asyncHandler(postulacionController.getById)
);

// Crear postulación — cualquier investigador autenticado con permiso
router.post(
  '/retos/:retoId/postulaciones',
  requirePermission('postular:convocatoria'),
  validate(createPostulacionSchema),
  asyncHandler(postulacionController.create)
);

// Evaluar — gestores y admins (aprobar:evidencia es el permiso de revisión más cercano,
// pero usamos editar:proceso como proxy de gestor de proceso)
router.patch(
  '/:id/evaluar',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(evaluarPostulacionSchema),
  asyncHandler(postulacionController.evaluar)
);

// Seleccionar ganador
router.patch(
  '/:id/seleccionar',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  asyncHandler(postulacionController.seleccionar)
);

// Rechazar postulación
router.patch(
  '/:id/rechazar',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(rechazarPostulacionSchema),
  asyncHandler(postulacionController.rechazar)
);

export default router;