import { Router } from 'express';
import grupoController from '../controllers/grupo.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createGrupoSchema,
  updateGrupoSchema,
  addMiembroSchema,
  listGruposQuerySchema,
  listPostulacionesQuerySchema
} from '../validators/grupo.validator.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', validateQuery(listGruposQuerySchema), asyncHandler(grupoController.list));
router.get('/:id', validateParams(idParamSchema), asyncHandler(grupoController.getById));

router.post('/', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validate(createGrupoSchema), asyncHandler(grupoController.create));

router.patch('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(updateGrupoSchema), asyncHandler(grupoController.update));

router.delete('/:id', authorize('ADMIN_SISTEMA'), validateParams(idParamSchema), asyncHandler(grupoController.delete));

router.get(
  '/:id/postulaciones',
  validateParams(idParamSchema),
  validateQuery(listPostulacionesQuerySchema),
  asyncHandler(grupoController.listPostulaciones)
);

router.post('/:id/miembros', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(addMiembroSchema), asyncHandler(grupoController.addMiembro));

router.delete('/:id/miembros/:miembroId', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), asyncHandler(grupoController.removeMiembro));

export default router;