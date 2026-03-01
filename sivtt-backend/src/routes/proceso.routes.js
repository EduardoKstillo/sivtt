import { Router } from 'express';
import procesoController from '../controllers/proceso.controller.js';
import { authenticate, authorize, requirePermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createProcesoSchema,
  updateProcesoSchema,
  updateTRLSchema,
  assignUsuarioSchema,
  listProcesosQuerySchema
} from '../validators/proceso.validator.js';
import { idParamSchema, procesoIdParamSchema } from '../validators/common.validator.js';

// Empresas
import empresaController from '../controllers/empresa.controller.js';
import { 
  listEmpresasDisponiblesQuerySchema, 
  reactivarEmpresaSchema, 
  retirarEmpresaSchema, 
  updateVinculacionSchema, 
  vincularEmpresaSchema 
} from '../validators/empresa.validator.js';

import retoController from '../controllers/reto.controller.js';
import { createRetoSchema, updateRetoSchema } from '../validators/reto.validator.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  requirePermission('ver:proceso'),
  validateQuery(listProcesosQuerySchema),
  asyncHandler(procesoController.list)
);

router.get(
  '/:id',
  requirePermission('ver:proceso'),
  validateParams(idParamSchema),
  asyncHandler(procesoController.getById)
);

// Escritura — requiere permiso de edición
router.post(
  '/',
  requirePermission('editar:proceso'),
  validate(createProcesoSchema),
  asyncHandler(procesoController.create)
);

router.patch(
  '/:id',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(updateProcesoSchema),
  asyncHandler(procesoController.update)
);

router.delete(
  '/:id',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  asyncHandler(procesoController.delete)
);

router.patch(
  '/:id/trl',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(updateTRLSchema),
  asyncHandler(procesoController.updateTRL)
);

// Gestión de usuarios del proceso
router.post(
  '/:id/usuarios',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(assignUsuarioSchema),
  asyncHandler(procesoController.assignUsuario)
);

router.delete(
  '/:id/usuarios/:usuarioId',
  requirePermission('editar:proceso'),
  asyncHandler(procesoController.removeUsuario)
);

// RETO TECNOLÓGICO (REQUERIMIENTO)

router.get(
  '/:procesoId/reto',
  validateParams(procesoIdParamSchema),
  asyncHandler(retoController.getByProceso)
);

router.post(
  '/:procesoId/reto',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'),
  validateParams(procesoIdParamSchema),
  validate(createRetoSchema),
  asyncHandler(retoController.create)
);

router.patch(
  '/:procesoId/reto/:id',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'),
  validateParams(idParamSchema),
  validate(updateRetoSchema),
  asyncHandler(retoController.update)
);


// EMPRESAS

router.get(
  '/:procesoId/empresas',
  requirePermission('ver:proceso'),
  validateParams(procesoIdParamSchema),
  asyncHandler(empresaController.listByProceso)
);

router.get(
  '/:procesoId/empresas/disponibles',
  requirePermission('ver:proceso'),
  validateParams(procesoIdParamSchema),
  validateQuery(listEmpresasDisponiblesQuerySchema),
  asyncHandler(empresaController.listDisponibles)
);

router.post(
  '/:procesoId/empresas',
  requirePermission('editar:proceso'),
  validateParams(procesoIdParamSchema),
  validate(vincularEmpresaSchema),
  asyncHandler(empresaController.vincular)
);

router.patch(
  '/:procesoId/empresas/:id',
  requirePermission('editar:proceso'),
  validate(updateVinculacionSchema),
  asyncHandler(empresaController.updateVinculacion)
);

router.patch(
  '/:procesoId/empresas/:id/retirar',
  requirePermission('editar:proceso'),
  validate(retirarEmpresaSchema),
  asyncHandler(empresaController.retirar)
);

router.patch(
  '/:procesoId/empresas/:id/reactivar',
  requirePermission('editar:proceso'),
  validate(reactivarEmpresaSchema),
  asyncHandler(empresaController.reactivar)
);

export default router;