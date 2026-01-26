import { Router } from 'express';
import financiamientoController from '../controllers/financiamiento.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.use(authenticate);

router.get('/procesos/:procesoId/financiamientos', asyncHandler(financiamientoController.listByProceso));

router.get('/:id', asyncHandler(financiamientoController.getById));

router.post('/procesos/:procesoId/financiamientos', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), asyncHandler(financiamientoController.create));

router.patch('/:id', authorize('ADMIN_SISTEMA', 'GESTOR_VINCULACION'), asyncHandler(financiamientoController.update));

router.delete('/:id', authorize('ADMIN_SISTEMA'), asyncHandler(financiamientoController.delete));

export default router;