import { Router } from 'express';
import rolController from '../controllers/rol.controller.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createRolSchema,
  updateRolSchema,
  toggleEstadoRolSchema,
  createPermisoSchema,
  updatePermisoSchema,
  assignPermisosSchema,
  syncPermisosSchema,
  listRolesQuerySchema,
  listPermisosQuerySchema
} from '../validators/rol.validator.js';

const router = Router();

router.use(authenticate);

// ==========================================
// ROLES
// ==========================================

// GET /roles — listar roles (con filtro por ámbito)
router.get(
  '/',
  requirePermission('ver:roles'),
  validateQuery(listRolesQuerySchema),
  asyncHandler(rolController.listRoles)
);

// GET /roles/:id — detalle de un rol con sus permisos
router.get(
  '/:id',
  requirePermission('ver:roles'),
  validateParams(idParamSchema),
  asyncHandler(rolController.getRolById)
);

// POST /roles — crear nuevo rol
router.post(
  '/',
  requirePermission('gestionar:roles'),
  validate(createRolSchema),
  asyncHandler(rolController.createRol)
);

// PATCH /roles/:id — actualizar rol
router.patch(
  '/:id',
  requirePermission('gestionar:roles'),
  validateParams(idParamSchema),
  validate(updateRolSchema),
  asyncHandler(rolController.updateRol)
);

// PATCH /roles/:id/toggle-estado — activar/desactivar rol
router.patch(
  '/:id/toggle-estado',
  requirePermission('gestionar:roles'),
  validateParams(idParamSchema),
  validate(toggleEstadoRolSchema),
  asyncHandler(rolController.toggleEstadoRol)
);

// ==========================================
// PERMISOS ASIGNADOS A UN ROL
// ==========================================

// POST /roles/:id/permisos — agregar permisos a un rol (sin eliminar los existentes)
router.post(
  '/:id/permisos',
  requirePermission('gestionar:roles'),
  validateParams(idParamSchema),
  validate(assignPermisosSchema),
  asyncHandler(rolController.assignPermisos)
);

// PUT /roles/:id/permisos — sincronizar permisos de un rol (reemplaza todo)
router.put(
  '/:id/permisos',
  requirePermission('gestionar:roles'),
  validateParams(idParamSchema),
  validate(syncPermisosSchema),
  asyncHandler(rolController.syncPermisos)
);

// DELETE /roles/:id/permisos/:permisoId — quitar un permiso específico del rol
router.delete(
  '/:id/permisos/:permisoId',
  requirePermission('gestionar:roles'),
  asyncHandler(rolController.removePermiso)
);

// ==========================================
// CATÁLOGO DE PERMISOS
// ==========================================

// GET /roles/permisos/catalogo — listar todos los permisos del sistema
router.get(
  '/permisos/catalogo',
  requirePermission('ver:roles'),
  validateQuery(listPermisosQuerySchema),
  asyncHandler(rolController.listPermisos)
);

// POST /roles/permisos/catalogo — crear un permiso nuevo
router.post(
  '/permisos/catalogo',
  requirePermission('gestionar:roles'),
  validate(createPermisoSchema),
  asyncHandler(rolController.createPermiso)
);

// PATCH /roles/permisos/catalogo/:id — actualizar un permiso
router.patch(
  '/permisos/catalogo/:id',
  requirePermission('gestionar:roles'),
  validateParams(idParamSchema),
  validate(updatePermisoSchema),
  asyncHandler(rolController.updatePermiso)
);

// DELETE /roles/permisos/catalogo/:id — eliminar un permiso del catálogo
router.delete(
  '/permisos/catalogo/:id',
  requirePermission('gestionar:roles'),
  validateParams(idParamSchema),
  asyncHandler(rolController.deletePermiso)
);

export default router;