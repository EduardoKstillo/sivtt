import prisma from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

class ComentarioService {
  async listByActividad(actividadId) {
    const actividad = await prisma.actividadFase.findUnique({
      where: { id: parseInt(actividadId), deletedAt: null }
    });

    if (!actividad) throw new NotFoundError('Actividad');

    return await prisma.comentarioActividad.findMany({
      where: { actividadId: parseInt(actividadId), deletedAt: null },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, email: true } },
        evidencia: { select: { id: true, nombreArchivo: true, version: true } }
      },
      orderBy: { createdAt: 'asc' } // El más antiguo primero
    });
  }

  async createMensaje(actividadId, userId, texto) {
    if (!texto || !texto.trim()) throw new ValidationError('El mensaje no puede estar vacío');

    return await prisma.comentarioActividad.create({
      data: {
        actividadId: parseInt(actividadId),
        usuarioId: userId,
        texto: texto.trim(),
        tipo: 'MENSAJE'
      },
      include: {
        usuario: { select: { id: true, nombres: true, apellidos: true, email: true } },
        evidencia: { select: { id: true, nombreArchivo: true, version: true } }
      }
    });
  }
}

export default new ComentarioService();