import { Router } from 'express';
import grupoController from '../controllers/grupo.controller.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
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

// Lectura — cualquier usuario autenticado con permiso de ver convocatorias
router.get(
  '/',
  requirePermission('ver:convocatorias', 'ver:proceso'),
  validateQuery(listGruposQuerySchema),
  asyncHandler(grupoController.list)
);

router.get(
  '/:id',
  requirePermission('ver:convocatorias', 'ver:proceso'),
  validateParams(idParamSchema),
  asyncHandler(grupoController.getById)
);

router.get(
  '/:id/postulaciones',
  requirePermission('ver:convocatorias', 'ver:proceso'),
  validateParams(idParamSchema),
  validateQuery(listPostulacionesQuerySchema),
  asyncHandler(grupoController.listPostulaciones)
);

// Escritura — requiere editar:proceso
router.post(
  '/',
  requirePermission('editar:proceso'),
  validate(createGrupoSchema),
  asyncHandler(grupoController.create)
);

router.patch(
  '/:id',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(updateGrupoSchema),
  asyncHandler(grupoController.update)
);

router.delete(
  '/:id',
  requirePermission('gestionar:usuarios'),
  validateParams(idParamSchema),
  asyncHandler(grupoController.delete)
);

router.post(
  '/:id/miembros',
  requirePermission('editar:proceso'),
  validateParams(idParamSchema),
  validate(addMiembroSchema),
  asyncHandler(grupoController.addMiembro)
);

router.delete(
  '/:id/miembros/:miembroId',
  requirePermission('editar:proceso'),
  asyncHandler(grupoController.removeMiembro)
);

export default router;