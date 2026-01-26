import { Router } from 'express';
import historialController from '../controllers/historial.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { procesoIdParamSchema } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get('/procesos/:procesoId/historial', validateParams(procesoIdParamSchema), asyncHandler(historialController.getHistorialCompleto));

router.get('/procesos/:procesoId/historial/trl', validateParams(procesoIdParamSchema), asyncHandler(historialController.getHistorialTRL));

router.get('/procesos/:procesoId/historial/estados', validateParams(procesoIdParamSchema), asyncHandler(historialController.getHistorialEstados));

router.get('/procesos/:procesoId/historial/fases', validateParams(procesoIdParamSchema), asyncHandler(historialController.getHistorialFases));

router.get('/procesos/:procesoId/historial/empresas', validateParams(procesoIdParamSchema), asyncHandler(historialController.getHistorialEmpresas));

export default router;