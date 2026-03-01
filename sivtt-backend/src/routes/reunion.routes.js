import { Router } from 'express';
import reunionController from '../controllers/reunion.controller.js';
import { authenticate, requirePermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createReunionSchema,
  updateReunionSchema,
  completarReunionSchema,
  addParticipanteSchema,
  listReunionesQuerySchema
} from '../validators/reunion.validator.js';
import { procesoIdParamSchema, idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

// Lectura
router.get(
  '/procesos/:procesoId/reuniones',
  requirePermission('ver:proceso', 'ver:actividad'),
  validateParams(procesoIdParamSchema),
  validateQuery(listReunionesQuerySchema),
  asyncHandler(reunionController.listByProceso)
);

router.get(
  '/:id',
  requirePermission('ver:proceso', 'ver:actividad'),
  validateParams(idParamSchema),
  asyncHandler(reunionController.getById)
);

// Crear reunión para actividad
router.post(
  '/actividades/:actividadId/reunion',
  requirePermission('editar:actividad', 'crear:actividad'),
  validate(createReunionSchema),
  asyncHandler(reunionController.create)
);

// Actualizar reunión
router.patch(
  '/:id',
  requirePermission('editar:actividad'),
  validateParams(idParamSchema),
  validate(updateReunionSchema),
  asyncHandler(reunionController.update)
);

// Completar reunión — quien ejecuta la actividad
router.patch(
  '/:id/completar',
  requirePermission('editar:actividad', 'subir:evidencia'),
  validateParams(idParamSchema),
  validate(completarReunionSchema),
  asyncHandler(reunionController.completar)
);

// Participantes
router.post(
  '/:id/participantes',
  requirePermission('editar:actividad', 'crear:actividad'),
  validateParams(idParamSchema),
  validate(addParticipanteSchema),
  asyncHandler(reunionController.addParticipante)
);

router.delete(
  '/:id/participantes/:participanteId',
  requirePermission('editar:actividad'),
  asyncHandler(reunionController.removeParticipante)
);

export default router;