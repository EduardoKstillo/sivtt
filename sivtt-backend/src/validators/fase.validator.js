import Joi from 'joi';

export const updateFaseSchema = Joi.object({
  responsableId: Joi.number().integer().allow(null),
  observaciones: Joi.string().allow('', null)
}).min(1);

export const closeFaseSchema = Joi.object({
  observaciones: Joi.string().allow('', null)
});