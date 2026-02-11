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
      
      // req.validatedData tiene los campos de texto validados por Joi
      // req.body tiene los campos de texto crudos (Multer)
      const body = req.validatedData || req.body; 

      // 1. Validar que exista algo (Archivo físico o Link de texto)
      const linkProvided = body.link || body.urlArchivo;

      if (!req.file && !linkProvided) {
        throw new ValidationError('Debe subir un archivo o proporcionar un enlace válido');
      }

      // 2. Parsear requisito
      let reqIdRaw = body.requisitoId;
      let requisitoId = null;
      if (reqIdRaw && reqIdRaw !== 'extra' && reqIdRaw !== 'null' && reqIdRaw !== 'undefined') {
          requisitoId = parseInt(reqIdRaw);
      }

      // 3. Preparar datos
      // Nota: Si no tienes el enum ENLACE en la BD, usa 'OTRO' o 'DOCUMENTO' como fallback
      const tipoParaBD = body.tipoEvidencia === 'ENLACE' ? 'OTRO' : (body.tipoEvidencia || 'DOCUMENTO');

      const data = {
        requisitoId,
        tipoEvidencia: req.file ? (body.tipoEvidencia || 'DOCUMENTO') : tipoParaBD,
        
        // Nombre: Del archivo o el que escribió el usuario para el link
        nombreArchivo: req.file ? req.file.originalname : (body.nombreArchivo || 'Enlace Externo'),
        
        // URL: Path del archivo o el Link
        urlArchivo: req.file ? req.file.path : linkProvided,
        
        tamaño: req.file ? req.file.size : 0,
        descripcion: body.descripcion
      };

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