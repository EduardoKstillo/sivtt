import comentarioService from '../services/comentario.service.js';
import { successResponse } from '../utils/responses.js';

class ComentarioController {
  async listByActividad(req, res) {
    const { actividadId } = req.params;
    const comentarios = await comentarioService.listByActividad(actividadId);
    res.status(200).json(successResponse(comentarios));
  }

  async createMensaje(req, res) {
    const { actividadId } = req.params;
    const { texto } = req.body;
    const userId = req.user.id;

    const nuevoMensaje = await comentarioService.createMensaje(actividadId, userId, texto);
    res.status(201).json(successResponse(nuevoMensaje, 'Mensaje enviado'));
  }
}

export default new ComentarioController();