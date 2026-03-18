import { Router } from 'express';
import procesoController from '../controllers/proceso.controller.js';
import { authenticate, requireSystemPermission, requireProcesoPermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createProcesoSchema,
  updateProcesoSchema,
  updateTRLSchema,
  assignUsuarioSchema,
  listProcesosQuerySchema,
  changeEstadoSchema
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

// ==========================================
// RUTAS DE SISTEMA (Globales, no tienen :id)
// ==========================================

router.get(
  '/',
  requireSystemPermission('acceso:basico'), // Acceso básico, el controller filtrará qué procesos ve según su usuario
  validateQuery(listProcesosQuerySchema),
  asyncHandler(procesoController.list)
);

// Escritura — crear un proceso nuevo es una acción global
router.post(
  '/',
  requireSystemPermission('editar:proceso', 'crear:proceso'), // Permiso de sistema para iniciar procesos
  validate(createProcesoSchema),
  asyncHandler(procesoController.create)
);

// ==========================================
// RUTAS DE CONTEXTO: PROCESO (:id o :procesoId)
// ==========================================

router.get(
  '/:id',
  requireProcesoPermission('ver:proceso'), // Solo Gestores de ESTE proceso (o Admins)
  validateParams(idParamSchema),
  asyncHandler(procesoController.getById)
);

router.patch(
  '/:id',
  requireProcesoPermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(updateProcesoSchema),
  asyncHandler(procesoController.update)
);

router.patch(
  '/:id/estado',
  requireSystemPermission('crear:proceso'),
  validateParams(idParamSchema),
  validate(changeEstadoSchema),
  asyncHandler(procesoController.changeEstado)
);

router.delete(
  '/:id',
  requireSystemPermission('crear:proceso'),
  validateParams(idParamSchema),
  asyncHandler(procesoController.delete)
);

router.patch(
  '/:id/trl',
  requireProcesoPermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(updateTRLSchema),
  asyncHandler(procesoController.updateTRL)
);

// Gestión de usuarios del proceso
router.post(
  '/:id/usuarios',
  requireProcesoPermission('asignar:equipo', 'editar:proceso'),
  validateParams(idParamSchema),
  validate(assignUsuarioSchema),
  asyncHandler(procesoController.assignUsuario)
);

router.delete(
  '/:id/usuarios/:usuarioId',
  requireProcesoPermission('asignar:equipo', 'editar:proceso'),
  asyncHandler(procesoController.removeUsuario)
);

// ==========================================
// RETO TECNOLÓGICO (Hereda el contexto del proceso)
// ==========================================

router.get(
  '/:procesoId/reto',
  requireProcesoPermission('ver:proceso'),
  validateParams(procesoIdParamSchema),
  asyncHandler(retoController.getByProceso)
);

router.post(
  '/:procesoId/reto',
  requireProcesoPermission('editar:proceso'), // Reemplaza al authorize() antiguo
  validateParams(procesoIdParamSchema),
  validate(createRetoSchema),
  asyncHandler(retoController.create)
);

router.patch(
  '/:procesoId/reto/:id',
  requireProcesoPermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(updateRetoSchema),
  asyncHandler(retoController.update)
);

// ==========================================
// EMPRESAS (Heredan el contexto del proceso)
// ==========================================

router.get(
  '/:procesoId/empresas',
  requireProcesoPermission('ver:proceso'),
  validateParams(procesoIdParamSchema),
  asyncHandler(empresaController.listByProceso)
);

router.get(
  '/:procesoId/empresas/disponibles',
  requireProcesoPermission('ver:proceso'),
  validateParams(procesoIdParamSchema),
  validateQuery(listEmpresasDisponiblesQuerySchema),
  asyncHandler(empresaController.listDisponibles)
);

router.post(
  '/:procesoId/empresas',
  requireProcesoPermission('editar:proceso'),
  validateParams(procesoIdParamSchema),
  validate(vincularEmpresaSchema),
  asyncHandler(empresaController.vincular)
);

router.patch(
  '/:procesoId/empresas/:id',
  requireProcesoPermission('editar:proceso'),
  validate(updateVinculacionSchema),
  asyncHandler(empresaController.updateVinculacion)
);

router.patch(
  '/:procesoId/empresas/:id/retirar',
  requireProcesoPermission('editar:proceso'),
  validate(retirarEmpresaSchema),
  asyncHandler(empresaController.retirar)
);

router.patch(
  '/:procesoId/empresas/:id/reactivar',
  requireProcesoPermission('editar:proceso'),
  validate(reactivarEmpresaSchema),
  asyncHandler(empresaController.reactivar)
);

export default router;