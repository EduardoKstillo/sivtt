import { Router } from 'express';
import actividadController from '../controllers/actividad.controller.js';
import { authenticate, requireProcesoPermission, requireActividadPermission, requireActiveProceso } from '../middlewares/auth.js';
import { validate, validateQuery, validateParams } from '../middlewares/validator.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { createActividadSchema, updateActividadSchema, changeEstadoActividadSchema, assignUsuarioActividadSchema, listActividadesQuerySchema } from '../validators/actividad.validator.js';
import { procesoIdParamSchema, idParamSchema, actividadIdParamSchema } from '../validators/common.validator.js';
import comentarioController from '../controllers/comentario.controller.js';

const router = Router();

router.use(authenticate); // Todo requiere login

// ===============================
// RUTAS DE SISTEMA (No requieren contexto local, filtra por req.user.id en el service)
// ===============================
router.get('/mis-asignaciones', validateQuery(listActividadesQuerySchema), asyncHandler(actividadController.getMisAsignaciones));

// ===============================
// RUTAS CONTEXTO: PROCESO (:procesoId)
// ===============================
router.get(
  '/procesos/:procesoId/actividades',
  requireProcesoPermission('ver:proceso', 'ver:actividad'), // Validamos que esté en el proceso
  validateParams(procesoIdParamSchema),
  validateQuery(listActividadesQuerySchema),
  asyncHandler(actividadController.listByProceso)
);

router.post(
  '/procesos/:procesoId/actividades',
  requireProcesoPermission('crear:actividad'),
  requireActiveProceso, // ✅ Añadido
  validateParams(procesoIdParamSchema),
  validate(createActividadSchema),
  asyncHandler(actividadController.create)
);

// ===============================
// RUTAS CONTEXTO: ACTIVIDAD (:id)
// ===============================
router.get(
  '/:id',
  requireActividadPermission('ver:actividad'), // Responsables o revisores de ESTA actividad
  validateParams(idParamSchema),
  asyncHandler(actividadController.getById)
);

router.patch(
  '/:id',
  requireActividadPermission('editar:actividad'),
  requireActiveProceso, // ✅ Añadido
  validateParams(idParamSchema),
  validate(updateActividadSchema),
  asyncHandler(actividadController.update)
);

router.patch(
  '/:id/estado',
  requireActividadPermission('editar:actividad', 'aprobar:evidencia'),
  requireActiveProceso, // ✅ Añadido
  validateParams(idParamSchema),
  validate(changeEstadoActividadSchema),
  asyncHandler(actividadController.changeEstado)
);

router.post(
  '/:id/aprobar',
  requireActiveProceso,
  requireActividadPermission('aprobar:evidencia'),
  validateParams(idParamSchema),
  asyncHandler(actividadController.aprobar)
);

router.delete(
  '/:id',
  requireActiveProceso,
  requireActividadPermission('eliminar:actividad'),
  validateParams(idParamSchema),
  asyncHandler(actividadController.delete)
);

// Asignaciones
router.post(
  '/:id/asignaciones',
  requireActiveProceso,
  requireActividadPermission('editar:actividad'),
  validateParams(idParamSchema),
  validate(assignUsuarioActividadSchema),
  asyncHandler(actividadController.assignUsuario)
);

router.delete(
  '/:id/asignaciones/:usuarioId',
  requireActiveProceso,
  requireActividadPermission('editar:actividad'),
  asyncHandler(actividadController.removeUsuario)
);

// ===============================
// 💬 CHAT / DISCUSIÓN DE LA ACTIVIDAD
// ===============================
router.get(
  '/:actividadId/comentarios',
  requireActividadPermission('editar:actividad', 'aprobar:evidencia', 'subir:evidencia'),
  validateParams(actividadIdParamSchema),
  asyncHandler(comentarioController.listByActividad)
);

router.post(
  '/:actividadId/comentarios',
  requireActividadPermission('editar:actividad', 'aprobar:evidencia'), // Responsables o Revisores pueden chatear
  requireActiveProceso,
  validateParams(actividadIdParamSchema),
  asyncHandler(comentarioController.createMensaje)
);

// ===============================
// 🚀 PASE A REVISIÓN MANUAL
// ===============================
router.post(
  '/:id/enviar-revision',
  requireActividadPermission('editar:actividad', 'subir:evidencia'), // Solo los responsables/gestores pueden enviarlo
  requireActiveProceso,
  validateParams(idParamSchema),
  asyncHandler(actividadController.enviarARevision)
);

export default router;