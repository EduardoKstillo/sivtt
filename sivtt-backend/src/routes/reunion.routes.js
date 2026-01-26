// routes/reunion.routes.js
import { Router } from 'express';
import reunionController from '../controllers/reunion.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
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

// Listar reuniones de un proceso
router.get(
  '/procesos/:procesoId/reuniones',
  validateParams(procesoIdParamSchema),
  validateQuery(listReunionesQuerySchema),
  asyncHandler(reunionController.listByProceso)
);

// Detalle de reunión
router.get(
  '/:id',
  validateParams(idParamSchema),
  asyncHandler(reunionController.getById)
);

// Crear reunión para actividad
router.post(
  '/actividades/:actividadId/reunion',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'),
  validate(createReunionSchema),
  asyncHandler(reunionController.create)
);

// Actualizar reunión
router.patch(
  '/:id',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'),
  validateParams(idParamSchema),
  validate(updateReunionSchema),
  asyncHandler(reunionController.update)
);

// Completar reunión
router.patch(
  '/:id/completar',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'),
  validateParams(idParamSchema),
  validate(completarReunionSchema),
  asyncHandler(reunionController.completar)
);

// Agregar participante
router.post(
  '/:id/participantes',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'),
  validateParams(idParamSchema),
  validate(addParticipanteSchema),
  asyncHandler(reunionController.addParticipante)
);

// Remover participante
router.delete(
  '/:id/participantes/:participanteId',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'),
  asyncHandler(reunionController.removeParticipante)
);

export default router;