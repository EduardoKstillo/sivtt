import { Router } from 'express';
import convocatoriaController from '../controllers/convocatoria.controller.js';
import { authenticate, requireSystemPermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createConvocatoriaSchema,
  updateConvocatoriaSchema,
  relanzarConvocatoriaSchema,
  listConvocatoriasQuerySchema
} from '../validators/convocatoria.validator.js';
import { idParamSchema, retoIdParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

// Lectura global
router.get('/', requireSystemPermission('ver:convocatorias', 'ver:proceso'), validateQuery(listConvocatoriasQuerySchema), asyncHandler(convocatoriaController.list));
router.get('/:id', requireSystemPermission('ver:convocatorias', 'ver:proceso'), validateParams(idParamSchema), asyncHandler(convocatoriaController.getById));

// Creación y edición
router.post('/retos/:retoId/convocatorias', requireSystemPermission('editar:proceso'), validateParams(retoIdParamSchema), validate(createConvocatoriaSchema), asyncHandler(convocatoriaController.create));
router.patch('/:id', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), validate(updateConvocatoriaSchema), asyncHandler(convocatoriaController.update));

// Flujo de estados
router.patch('/:id/publicar', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), asyncHandler(convocatoriaController.publicar));
router.patch('/:id/cerrar', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), asyncHandler(convocatoriaController.cerrar));
router.post('/:id/relanzar', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), validate(relanzarConvocatoriaSchema), asyncHandler(convocatoriaController.relanzar));

export default router;