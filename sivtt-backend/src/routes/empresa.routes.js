import { Router } from 'express';
import empresaController from '../controllers/empresa.controller.js';
import { authenticate, requireSystemPermission } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createEmpresaSchema, updateEmpresaSchema, verifyEmpresaSchema,
  listEmpresasQuerySchema
} from '../validators/empresa.validator.js';
import { idParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

// Catálogo Global de Empresas
router.get('/', requireSystemPermission('ver:procesos'), validateQuery(listEmpresasQuerySchema), asyncHandler(empresaController.list));
router.get('/:id', requireSystemPermission('ver:procesos'), validateParams(idParamSchema), asyncHandler(empresaController.getById));
router.post('/', requireSystemPermission('editar:proceso'), validate(createEmpresaSchema), asyncHandler(empresaController.create));
router.patch('/:id', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), validate(updateEmpresaSchema), asyncHandler(empresaController.update));
router.patch('/:id/verificar', requireSystemPermission('editar:proceso'), validateParams(idParamSchema), validate(verifyEmpresaSchema), asyncHandler(empresaController.verify));
router.delete('/:id', requireSystemPermission('gestionar:usuarios'), validateParams(idParamSchema), asyncHandler(empresaController.delete));

export default router;