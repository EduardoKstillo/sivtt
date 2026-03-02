import { Router } from 'express';
import actividadController from '../controllers/actividad.controller.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
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

// ✅ Mis asignaciones — cualquier usuario autenticado puede ver sus propias actividades
// No requiere permiso específico: el service filtra por req.user.id
router.get(
  '/mis-asignaciones',
  validateQuery(listActividadesQuerySchema),
  asyncHandler(actividadController.getMisAsignaciones)
);

// Lectura
router.get(
  '/procesos/:procesoId/actividades',
  requirePermission('ver:actividad', 'ver:proceso'),
  validateParams(procesoIdParamSchema),
  validateQuery(listActividadesQuerySchema),
  asyncHandler(actividadController.listByProceso)
);

router.get(
  '/:id',
  requirePermission('ver:actividad', 'ver:proceso'),
  validateParams(idParamSchema),
  asyncHandler(actividadController.getById)
);

// Creación y edición
router.post(
  '/procesos/:procesoId/actividades',
  requirePermission('crear:actividad'),
  validateParams(procesoIdParamSchema),
  validate(createActividadSchema),
  asyncHandler(actividadController.create)
);

router.patch(
  '/:id',
  requirePermission('editar:actividad'),
  validateParams(idParamSchema),
  validate(updateActividadSchema),
  asyncHandler(actividadController.update)
);

// Cambio de estado — cualquiera con permiso de actividad puede moverla
router.patch(
  '/:id/estado',
  requirePermission('editar:actividad', 'ver:actividad'),
  validateParams(idParamSchema),
  validate(changeEstadoActividadSchema),
  asyncHandler(actividadController.changeEstado)
);

// Aprobar — requiere permiso de aprobación de evidencias (cierra la actividad)
router.post(
  '/:id/aprobar',
  requirePermission('aprobar:evidencia'),
  validateParams(idParamSchema),
  asyncHandler(actividadController.aprobar)
);

// Eliminación
router.delete(
  '/:id',
  requirePermission('eliminar:actividad'),
  validateParams(idParamSchema),
  asyncHandler(actividadController.delete)
);

// Asignaciones de usuarios a actividades
router.post(
  '/:id/asignaciones',
  requirePermission('editar:actividad'),
  validateParams(idParamSchema),
  validate(assignUsuarioActividadSchema),
  asyncHandler(actividadController.assignUsuario)
);

router.delete(
  '/:id/asignaciones/:usuarioId',
  requirePermission('editar:actividad'),
  asyncHandler(actividadController.removeUsuario)
);

export default router;