// validators/reunion.validator.js
import Joi from 'joi';

export const createReunionSchema = Joi.object({
  fechaProgramada: Joi.date().iso().min('now').required(),
  duracionMinutos: Joi.number().integer().min(15).max(480).default(60),
  participantes: Joi.array().items(
    Joi.object({
      usuarioId: Joi.number().integer(),
      nombre: Joi.string().when('usuarioId', {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.required()
      }),
      email: Joi.string().email().required(),
      rol: Joi.string().allow('', null)
    })
  ).default([])
});

export const updateReunionSchema = Joi.object({
  fechaProgramada: Joi.date().iso().min('now'),
  duracionMinutos: Joi.number().integer().min(15).max(480)
}).min(1);

export const completarReunionSchema = Joi.object({
  resumen: Joi.string().min(10).required(),
  acuerdos: Joi.array().items(Joi.string()).default([]),
  asistencias: Joi.array().items(
    Joi.object({
      participanteId: Joi.number().integer().required(),
      asistio: Joi.boolean().required()
    })
  )
});

export const addParticipanteSchema = Joi.object({
  usuarioId: Joi.number().integer(),
  nombre: Joi.string().when('usuarioId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  email: Joi.string().email().required(),
  rol: Joi.string().allow('', null)
});

export const listReunionesQuerySchema = Joi.object({
  realizada: Joi.boolean(),
  fecha_desde: Joi.date().iso(),
  fecha_hasta: Joi.date().iso().min(Joi.ref('fecha_desde')),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});