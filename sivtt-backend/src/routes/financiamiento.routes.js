import { Router } from 'express';
import financiamientoController from '../controllers/financiamiento.controller.js';
import { authenticate, requireSystemPermission, requireProcesoPermission } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.use(authenticate);

// Rutas contextuales (tienen :procesoId)
router.get(
  '/procesos/:procesoId/financiamientos',
  requireProcesoPermission('ver:proceso'),
  asyncHandler(financiamientoController.listByProceso)
);

router.post(
  '/procesos/:procesoId/financiamientos',
  requireProcesoPermission('editar:proceso'),
  asyncHandler(financiamientoController.create)
);

// Rutas directas (tienen :id)
router.get(
  '/:id',
  requireSystemPermission('ver:proceso'),
  asyncHandler(financiamientoController.getById)
);

router.patch(
  '/:id',
  requireSystemPermission('editar:proceso'),
  asyncHandler(financiamientoController.update)
);

// Solo administradores pueden eliminar financiamientos
router.delete(
  '/:id',
  requireSystemPermission('gestionar:usuarios'), // Proxy para ADMIN_SISTEMA
  asyncHandler(financiamientoController.delete)
);

export default router;