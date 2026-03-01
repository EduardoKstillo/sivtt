import { Router } from 'express';
import empresaController from '../controllers/empresa.controller.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createEmpresaSchema,
  updateEmpresaSchema,
  verifyEmpresaSchema,
  vincularEmpresaSchema,
  updateVinculacionSchema,
  retirarEmpresaSchema,
  reactivarEmpresaSchema,
  listEmpresasQuerySchema,
  listEmpresasDisponiblesQuerySchema
} from '../validators/empresa.validator.js';
import { idParamSchema, procesoIdParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

// Listado y detalle — requiere ver:proceso (gestores y admins)
router.get(
  '/',
  requirePermission('ver:proceso'),
  validateQuery(listEmpresasQuerySchema),
  asyncHandler(empresaController.list)
);

router.get(
  '/:id',
  requirePermission('ver:proceso'),
  validateParams(idParamSchema),
  asyncHandler(empresaController.getById)
);

// Creación y edición — requiere editar:proceso
router.post(
  '/',
  requirePermission('editar:proceso'),
  validate(createEmpresaSchema),
  asyncHandler(empresaController.create)
);

router.patch(
  '/:id',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(updateEmpresaSchema),
  asyncHandler(empresaController.update)
);

router.patch(
  '/:id/verificar',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(verifyEmpresaSchema),
  asyncHandler(empresaController.verify)
);

// Eliminación — solo admin (gestionar:usuarios es el permiso de mayor jerarquía del sistema)
router.delete(
  '/:id',
  requirePermission('gestionar:usuarios'),
  validateParams(idParamSchema),
  asyncHandler(empresaController.delete)
);

export default router;