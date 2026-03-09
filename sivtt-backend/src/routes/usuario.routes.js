import { Router } from 'express';
import usuarioController from '../controllers/usuario.controller.js';
import { authenticate, requireSystemPermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createUsuarioSchema, updateUsuarioSchema, changePasswordSchema,
  toggleEstadoSchema, assignRolSchema, listUsuariosQuerySchema
} from '../validators/usuario.validator.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/catalogo', requireSystemPermission('acceso:basico'), asyncHandler(usuarioController.getCatalogo));
router.get('/roles', requireSystemPermission('acceso:basico'), asyncHandler(usuarioController.listRoles));
router.get('/', requireSystemPermission('ver:usuarios'), validateQuery(listUsuariosQuerySchema), asyncHandler(usuarioController.list));
router.get('/:id', validateParams(idParamSchema), asyncHandler(usuarioController.getById));
router.post('/', requireSystemPermission('gestionar:usuarios'), validate(createUsuarioSchema), asyncHandler(usuarioController.create));
router.patch('/:id', requireSystemPermission('gestionar:usuarios'), validateParams(idParamSchema), validate(updateUsuarioSchema), asyncHandler(usuarioController.update));
router.patch('/:id/password', validateParams(idParamSchema), validate(changePasswordSchema), asyncHandler(usuarioController.changePassword));
router.patch('/:id/toggle-estado', requireSystemPermission('gestionar:usuarios'), validateParams(idParamSchema), validate(toggleEstadoSchema), asyncHandler(usuarioController.toggleEstado));
router.post('/:id/roles', requireSystemPermission('gestionar:roles'), validateParams(idParamSchema), validate(assignRolSchema), asyncHandler(usuarioController.assignRol));
router.delete('/:id/roles/:rolId', requireSystemPermission('gestionar:roles'), asyncHandler(usuarioController.removeRol));

export default router;