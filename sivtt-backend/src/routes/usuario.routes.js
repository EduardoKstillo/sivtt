import { Router } from 'express';
import usuarioController from '../controllers/usuario.controller.js';
import { authenticate, authorize, requirePermission } from '../middlewares/auth.js';
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

// Listado de usuarios — solo roles con permiso de gestión de usuarios
router.get(
  '/',
  requirePermission('ver:usuarios'),
  validateQuery(listUsuariosQuerySchema),
  asyncHandler(usuarioController.list)
);

// Catálogo de roles disponibles (sin datos sensibles, accesible a cualquier autenticado)
router.get(
  '/roles',
  asyncHandler(usuarioController.listRoles)
);

// Detalle de usuario — requiere permiso o ser el propio usuario
router.get(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(usuarioController.getById)
);

// Crear usuario — solo con permiso explícito
router.post(
  '/',
  requirePermission('gestionar:usuarios'),
  validate(createUsuarioSchema),
  asyncHandler(usuarioController.create)
);

// Actualizar datos de usuario
router.patch(
  '/:id',
  requirePermission('gestionar:usuarios'),
  validateParams(idParamSchema),
  validate(updateUsuarioSchema),
  asyncHandler(usuarioController.update)
);

// Cambio de contraseña — se verifica la contraseña actual, no requiere permiso especial
router.patch(
  '/:id/password',
  validateParams(idParamSchema),
  validate(changePasswordSchema),
  asyncHandler(usuarioController.changePassword)
);

// Activar/desactivar usuario
router.patch(
  '/:id/toggle-estado',
  requirePermission('gestionar:usuarios'),
  validateParams(idParamSchema),
  validate(toggleEstadoSchema),
  asyncHandler(usuarioController.toggleEstado)
);

// Asignar rol de SISTEMA a un usuario
router.post(
  '/:id/roles',
  requirePermission('gestionar:roles'),
  validateParams(idParamSchema),
  validate(assignRolSchema),
  asyncHandler(usuarioController.assignRol)
);

// Quitar rol de SISTEMA de un usuario
router.delete(
  '/:id/roles/:rolId',
  requirePermission('gestionar:roles'),
  asyncHandler(usuarioController.removeRol)
);

export default router;