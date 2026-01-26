import Joi from 'joi';

export const createConvocatoriaSchema = Joi.object({
  titulo: Joi.string().required(),
  descripcion: Joi.string().required(),
  fechaApertura: Joi.date().iso().required(),
  fechaCierre: Joi.date().iso().greater(Joi.ref('fechaApertura')).required(),

  // 🔥 VALIDACIÓN MEJORADA de criteriosSeleccion
  criteriosSeleccion: Joi.object({
    criterios: Joi.array().items(
      Joi.object({
        nombre: Joi.string().required(),
        peso: Joi.number().min(0).max(100).required(),
        descripcion: Joi.string().required()
      })
    ).required().min(1),
    puntajeMinimo: Joi.number().min(0).max(100).required()
  }).custom((value, helpers) => {
    // Validar que la suma de pesos sea 100
    const sumaPesos = value.criterios.reduce((sum, c) => sum + c.peso, 0);
    if (sumaPesos !== 100) {
      return helpers.error('any.invalid', {
        message: `La suma de pesos de los criterios debe ser 100 (actual: ${sumaPesos})`
      });
    }
    return value;
  }),

  requisitosPostulacion: Joi.object({
    documentos: Joi.array().items(Joi.string()).default([]),
    requisitosGrupo: Joi.array().items(Joi.string()).default([])
  })
});

// ACTUALIZAR updateConvocatoriaSchema
export const updateConvocatoriaSchema = Joi.object({
  titulo: Joi.string(),
  descripcion: Joi.string(),
  fechaApertura: Joi.date().iso(),
  fechaCierre: Joi.date().iso(),

  // 🔥 VALIDACIÓN MEJORADA de criteriosSeleccion
  criteriosSeleccion: Joi.object({
    criterios: Joi.array().items(
      Joi.object({
        nombre: Joi.string().required(),
        peso: Joi.number().min(0).max(100).required(),
        descripcion: Joi.string().required()
      })
    ).min(1),
    puntajeMinimo: Joi.number().min(0).max(100)
  }).custom((value, helpers) => {
    if (value.criterios) {
      const sumaPesos = value.criterios.reduce((sum, c) => sum + c.peso, 0);
      if (sumaPesos !== 100) {
        return helpers.error('any.invalid', {
          message: `La suma de pesos de los criterios debe ser 100 (actual: ${sumaPesos})`
        });
      }
    }
    return value;
  }),

  requisitosPostulacion: Joi.object()
}).min(1);

export const relanzarConvocatoriaSchema = Joi.object({
  motivoRelanzamiento: Joi.string().min(10).required(),
  fechaApertura: Joi.date().iso().required(),
  fechaCierre: Joi.date().iso().greater(Joi.ref('fechaApertura')).required(),
  modificaciones: Joi.object()
});

export const listConvocatoriasQuerySchema = Joi.object({
  estatus: Joi.string().valid('BORRADOR', 'PUBLICADA', 'CERRADA', 'CANCELADA'),
  retoId: Joi.number().integer(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});