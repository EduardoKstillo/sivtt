import { Router } from 'express';
import empresaController from '../controllers/empresa.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createEmpresaSchema,
  updateEmpresaSchema,
  verifyEmpresaSchema,
  vincularEmpresaSchema,
  updateVinculacionSchema,
  retirarEmpresaSchema,
  reactivarEmpresaSchema,
  listEmpresasQuerySchema,
  listEmpresasDisponiblesQuerySchema
} from '../validators/empresa.validator.js';
import { idParamSchema, procesoIdParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateQuery(listEmpresasQuerySchema), asyncHandler(empresaController.list));

router.get('/:id', validateParams(idParamSchema), asyncHandler(empresaController.getById));

router.post('/', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validate(createEmpresaSchema), asyncHandler(empresaController.create));

router.patch('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(updateEmpresaSchema), asyncHandler(empresaController.update));

router.patch('/:id/verificar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(verifyEmpresaSchema), asyncHandler(empresaController.verify));

router.delete('/:id', authorize('ADMIN_SISTEMA'), validateParams(idParamSchema), asyncHandler(empresaController.delete));

export default router;