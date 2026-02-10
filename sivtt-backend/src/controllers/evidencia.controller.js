import evidenciaService from '../services/evidencia.service.js';
import { successResponse } from '../utils/responses.js';

class EvidenciaController {
  async listByProceso(req, res, next) {
    try {
      const { procesoId } = req.validatedParams;
      const result = await evidenciaService.listByProceso(parseInt(procesoId), req.validatedQuery);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const evidencia = await evidenciaService.getById(parseInt(id));
      res.json(successResponse(evidencia));
    } catch (error) {
      next(error);
    }
  }

async create(req, res, next) {
    try {
      const { actividadId } = req.validatedParams;
      
      // 1️⃣ EXTRAER Y PARSEAR EL REQUISITO ID
      // Multer pone los campos de texto en req.body. 
      // Si tu validador lo procesó, estará en req.validatedData.
      // Usamos req.body como fallback seguro para form-data.
      let reqIdRaw = req.validatedData?.requisitoId || req.body?.requisitoId;
      
      let requisitoId = null;
      if (reqIdRaw && reqIdRaw !== 'extra' && reqIdRaw !== 'null' && reqIdRaw !== 'undefined') {
          requisitoId = parseInt(reqIdRaw);
      }

      const data = {
        requisitoId: requisitoId, // sirve para el versionamiento
        tipoEvidencia: req.validatedData.tipoEvidencia || req.body.tipoEvidencia,
        nombreArchivo: req.file?.originalname || 'archivo',
        urlArchivo: req.file?.path || 'https://storage.example.com/temp', // Aquí iría tu lógica de Cloudinary/S3
        tamaño: req.file?.size,
        descripcion: req.validatedData.descripcion || req.body.descripcion
      };

      // Pasamos el user.id
      const evidencia = await evidenciaService.create(parseInt(actividadId), data, req.user.id);
      
      res.status(201).json(successResponse(evidencia));
    } catch (error) {
      next(error);
    }
  }

  async review(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const { nuevoEstado, comentarioRevision } = req.validatedData;
      const evidencia = await evidenciaService.review(parseInt(id), nuevoEstado, comentarioRevision, req.user.id);
      res.json(successResponse(evidencia));
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.validatedParams;
      await evidenciaService.delete(parseInt(id));
      res.json(successResponse(null, 'Evidencia eliminada exitosamente'));
    } catch (error) {
      next(error);
    }
  }
}

export default new EvidenciaController();