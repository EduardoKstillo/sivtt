import { Router } from 'express';
import usuarioController from '../controllers/usuario.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  changePasswordSchema,
  toggleEstadoSchema,
  assignRolSchema,
  listUsuariosQuerySchema
} from '../validators/usuario.validator.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateQuery(listUsuariosQuerySchema), asyncHandler(usuarioController.list));

router.get('/roles', asyncHandler(usuarioController.listRoles));

router.get('/:id', validateParams(idParamSchema), asyncHandler(usuarioController.getById));

router.post('/', authorize('ADMIN_SISTEMA'), validate(createUsuarioSchema), asyncHandler(usuarioController.create));

router.patch('/:id', authorize('ADMIN_SISTEMA'), validateParams(idParamSchema), validate(updateUsuarioSchema), asyncHandler(usuarioController.update));

router.patch('/:id/password', validateParams(idParamSchema), validate(changePasswordSchema), asyncHandler(usuarioController.changePassword));

router.patch('/:id/toggle-estado', authorize('ADMIN_SISTEMA'), validateParams(idParamSchema), validate(toggleEstadoSchema), asyncHandler(usuarioController.toggleEstado));

router.post('/:id/roles', authorize('ADMIN_SISTEMA'), validateParams(idParamSchema), validate(assignRolSchema), asyncHandler(usuarioController.assignRol));

router.delete('/:id/roles/:rolId', authorize('ADMIN_SISTEMA'), asyncHandler(usuarioController.removeRol));

export default router;