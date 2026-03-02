import { Router } from 'express';
import grupoController from '../controllers/grupo.controller.js';
import { authenticate, requireSystemPermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createGrupoSchema, updateGrupoSchema, addMiembroSchema,
  listGruposQuerySchema, listPostulacionesQuerySchema
} from '../validators/grupo.validator.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', requireSystemPermission('ver:convocatorias', 'ver:proceso'), validateQuery(listGruposQuerySchema), asyncHandler(grupoController.list));
router.get('/:id', requireSystemPermission('ver:convocatorias', 'ver:proceso'), validateParams(idParamSchema), asyncHandler(grupoController.getById));
router.get('/:id/postulaciones', requireSystemPermission('ver:convocatorias', 'ver:proceso'), validateParams(idParamSchema), validateQuery(listPostulacionesQuerySchema), asyncHandler(grupoController.listPostulaciones));
router.post('/', requireSystemPermission('editar:proceso'), validate(createGrupoSchema), asyncHandler(grupoController.create));
router.patch('/:id', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), validate(updateGrupoSchema), asyncHandler(grupoController.update));
router.delete('/:id', requireSystemPermission('gestionar:usuarios'), validateParams(idParamSchema), asyncHandler(grupoController.delete));
router.post('/:id/miembros', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), validate(addMiembroSchema), asyncHandler(grupoController.addMiembro));
router.delete('/:id/miembros/:miembroId', requireSystemPermission('editar:proceso'), asyncHandler(grupoController.removeMiembro));

export default router;