import { Router } from 'express';
import rolController from '../controllers/rol.controller.js';
import { authenticate, requireSystemPermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createRolSchema, updateRolSchema, toggleEstadoRolSchema,
  createPermisoSchema, updatePermisoSchema, assignPermisosSchema,
  syncPermisosSchema, listRolesQuerySchema, listPermisosQuerySchema
} from '../validators/rol.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', requireSystemPermission('ver:roles'), validateQuery(listRolesQuerySchema), asyncHandler(rolController.listRoles));
router.get('/:id', requireSystemPermission('ver:roles'), validateParams(idParamSchema), asyncHandler(rolController.getRolById));
router.post('/', requireSystemPermission('gestionar:roles'), validate(createRolSchema), asyncHandler(rolController.createRol));
router.patch('/:id', requireSystemPermission('gestionar:roles'), validateParams(idParamSchema), validate(updateRolSchema), asyncHandler(rolController.updateRol));
router.patch('/:id/toggle-estado', requireSystemPermission('gestionar:roles'), validateParams(idParamSchema), validate(toggleEstadoRolSchema), asyncHandler(rolController.toggleEstadoRol));
router.post('/:id/permisos', requireSystemPermission('gestionar:roles'), validateParams(idParamSchema), validate(assignPermisosSchema), asyncHandler(rolController.assignPermisos));
router.put('/:id/permisos', requireSystemPermission('gestionar:roles'), validateParams(idParamSchema), validate(syncPermisosSchema), asyncHandler(rolController.syncPermisos));
router.delete('/:id/permisos/:permisoId', requireSystemPermission('gestionar:roles'), asyncHandler(rolController.removePermiso));
router.get('/permisos/catalogo', requireSystemPermission('ver:roles'), validateQuery(listPermisosQuerySchema), asyncHandler(rolController.listPermisos));
router.post('/permisos/catalogo', requireSystemPermission('gestionar:roles'), validate(createPermisoSchema), asyncHandler(rolController.createPermiso));
router.patch('/permisos/catalogo/:id', requireSystemPermission('gestionar:roles'), validateParams(idParamSchema), validate(updatePermisoSchema), asyncHandler(rolController.updatePermiso));
router.delete('/permisos/catalogo/:id', requireSystemPermission('gestionar:roles'), validateParams(idParamSchema), asyncHandler(rolController.deletePermiso));

export default router;