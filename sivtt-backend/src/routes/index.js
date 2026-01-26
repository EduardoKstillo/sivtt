import { Router } from 'express';
import authRoutes from './auth.routes.js';
import procesoRoutes from './proceso.routes.js';
import faseRoutes from './fase.routes.js';
import actividadRoutes from './actividad.routes.js';
import evidenciaRoutes from './evidencia.routes.js';
import decisionRoutes from './decision.routes.js';
import empresaRoutes from './empresa.routes.js';
import retoRoutes from './reto.routes.js';
import convocatoriaRoutes from './convocatoria.routes.js';
import grupoRoutes from './grupo.routes.js';
import postulacionRoutes from './postulacion.routes.js';
import usuarioRoutes from './usuario.routes.js';
import historialRoutes from './historial.routes.js';
import financiamientoRoutes from './financiamiento.routes.js';
import reunionRoutes from './reunion.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/procesos', procesoRoutes);
router.use('/fases', faseRoutes);
router.use('/actividades', actividadRoutes);
router.use('/evidencias', evidenciaRoutes);
router.use('/empresas', empresaRoutes);
router.use('/decisiones', decisionRoutes);
router.use('/retos', retoRoutes);
router.use('/convocatorias', convocatoriaRoutes);
router.use('/grupos', grupoRoutes);
router.use('/postulaciones', postulacionRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/historial', historialRoutes);
router.use('/financiamiento', financiamientoRoutes);
router.use('/reuniones', reunionRoutes);

export default router;