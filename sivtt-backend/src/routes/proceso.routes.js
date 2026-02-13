import { Router } from 'express';
import procesoController from '../controllers/proceso.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import {
  createProcesoSchema,
  updateProcesoSchema,
  updateTRLSchema,
  assignUsuarioSchema,
  listProcesosQuerySchema
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

router.get('/', validateQuery(listProcesosQuerySchema), asyncHandler(procesoController.list));
router.get('/:id', validateParams(idParamSchema), asyncHandler(procesoController.getById));

router.post('/', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validate(createProcesoSchema), asyncHandler(procesoController.create));

router.patch('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(updateProcesoSchema), asyncHandler(procesoController.update));

router.delete('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), asyncHandler(procesoController.delete));

router.patch('/:id/trl', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION', 'RESPONSABLE_FASE'), validateParams(idParamSchema), validate(updateTRLSchema), asyncHandler(procesoController.updateTRL));

router.post('/:id/usuarios', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(idParamSchema), validate(assignUsuarioSchema), asyncHandler(procesoController.assignUsuario));

router.delete('/:id/usuarios/:usuarioId', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), asyncHandler(procesoController.removeUsuario));

// RETO TECNOLÓGICO (REQUERIMIENTO)

router.get(
  '/:procesoId/reto',
  validateParams(procesoIdParamSchema),
  asyncHandler(retoController.getByProceso)
);

router.post(
  '/:procesoId/reto',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'),
  validateParams(procesoIdParamSchema),
  validate(createRetoSchema),
  asyncHandler(retoController.create)
);

router.patch(
  '/:procesoId/reto/:id',
  authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'),
  validateParams(idParamSchema),
  validate(updateRetoSchema),
  asyncHandler(retoController.update)
);


// EMPRESAS

router.get('/:procesoId/empresas', validateParams(procesoIdParamSchema), asyncHandler(empresaController.listByProceso));

router.get('/:procesoId/empresas/disponibles', validateParams(procesoIdParamSchema), validateQuery(listEmpresasDisponiblesQuerySchema), asyncHandler(empresaController.listDisponibles));

router.post('/:procesoId/empresas', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validateParams(procesoIdParamSchema), validate(vincularEmpresaSchema), asyncHandler(empresaController.vincular));

router.patch('/:procesoId/empresas/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validate(updateVinculacionSchema), asyncHandler(empresaController.updateVinculacion));

router.patch('/:procesoId/empresas/:id/retirar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validate(retirarEmpresaSchema), asyncHandler(empresaController.retirar));

router.patch('/:procesoId/empresas/:id/reactivar', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), validate(reactivarEmpresaSchema), asyncHandler(empresaController.reactivar));

export default router;