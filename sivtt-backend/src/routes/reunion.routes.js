import { Router } from 'express';
import reunionController from '../controllers/reunion.controller.js';
import { authenticate, requireSystemPermission, requireProcesoPermission, requireActividadPermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createReunionSchema, updateReunionSchema, completarReunionSchema,
  addParticipanteSchema, listReunionesQuerySchema
} from '../validators/reunion.validator.js';
import { procesoIdParamSchema, idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

// Contexto Proceso
router.get('/procesos/:procesoId/reuniones', requireProcesoPermission('ver:proceso', 'ver:actividad'), validateParams(procesoIdParamSchema), validateQuery(listReunionesQuerySchema), asyncHandler(reunionController.listByProceso));

// Contexto Actividad
router.post('/actividades/:actividadId/reunion', requireActividadPermission('editar:actividad', 'crear:actividad'), validate(createReunionSchema), asyncHandler(reunionController.create));

// Operaciones directas (Asumidas globales por ahora para evitar otro middleware custom)
router.get('/:id', requireSystemPermission('ver:proceso', 'ver:actividad'), validateParams(idParamSchema), asyncHandler(reunionController.getById));
router.patch('/:id', requireSystemPermission('editar:actividad'), validateParams(idParamSchema), validate(updateReunionSchema), asyncHandler(reunionController.update));
router.patch('/:id/completar', requireSystemPermission('editar:actividad', 'subir:evidencia'), validateParams(idParamSchema), validate(completarReunionSchema), asyncHandler(reunionController.completar));
router.post('/:id/participantes', requireSystemPermission('editar:actividad', 'crear:actividad'), validateParams(idParamSchema), validate(addParticipanteSchema), asyncHandler(reunionController.addParticipante));
router.delete('/:id/participantes/:participanteId', requireSystemPermission('editar:actividad'), asyncHandler(reunionController.removeParticipante));

export default router;