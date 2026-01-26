import { Router } from 'express';
import actividadController from '../controllers/actividad.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createActividadSchema,
  updateActividadSchema,
  changeEstadoActividadSchema,
  assignUsuarioActividadSchema,
  listActividadesQuerySchema
} from '../validators/actividad.validator.js';
import { procesoIdParamSchema, idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/procesos/:procesoId/actividades', validateParams(procesoIdParamSchema), validateQuery(listActividadesQuerySchema), asyncHandler(actividadController.listByProceso));

router.get('/:id', validateParams(idParamSchema), asyncHandler(actividadController.getById));

router.post('/procesos/:procesoId/actividades', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'), validateParams(procesoIdParamSchema), validate(createActividadSchema), asyncHandler(actividadController.create));

router.patch('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'), validateParams(idParamSchema), validate(updateActividadSchema), asyncHandler(actividadController.update));

router.patch('/:id/estado', validateParams(idParamSchema), validate(changeEstadoActividadSchema), asyncHandler(actividadController.changeEstado));

router.post(
  '/:id/aprobar',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'),
  validateParams(idParamSchema),
  asyncHandler(actividadController.aprobar)
);

router.delete('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), asyncHandler(actividadController.delete));

router.post('/:id/asignaciones', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'), validateParams(idParamSchema), validate(assignUsuarioActividadSchema), asyncHandler(actividadController.assignUsuario));

router.delete('/:id/asignaciones/:usuarioId', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'), asyncHandler(actividadController.removeUsuario));

export default router;