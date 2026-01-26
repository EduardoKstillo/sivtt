import Joi from 'joi';

export const createEmpresaSchema = Joi.object({
  razonSocial: Joi.string().required(),
  ruc: Joi.string().length(11).required(),
  nombreComercial: Joi.string().allow('', null),
  sector: Joi.string().allow('', null),
  tamaño: Joi.string().allow('', null),
  departamento: Joi.string().allow('', null),
  provincia: Joi.string().allow('', null),
  distrito: Joi.string().allow('', null),
  direccion: Joi.string().allow('', null),
  contactoPrincipal: Joi.string().allow('', null),
  cargoContacto: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  telefono: Joi.string().allow('', null)
});

export const updateEmpresaSchema = Joi.object({
  razonSocial: Joi.string(),
  nombreComercial: Joi.string().allow('', null),
  sector: Joi.string().allow('', null),
  tamaño: Joi.string().allow('', null),
  departamento: Joi.string().allow('', null),
  provincia: Joi.string().allow('', null),
  distrito: Joi.string().allow('', null),
  direccion: Joi.string().allow('', null),
  contactoPrincipal: Joi.string().allow('', null),
  cargoContacto: Joi.string().allow('', null),
  email: Joi.string().email().allow('', null),
  telefono: Joi.string().allow('', null)
}).min(1);

export const verifyEmpresaSchema = Joi.object({
  verificada: Joi.boolean().required()
});

export const vincularEmpresaSchema = Joi.object({
  empresaId: Joi.number().integer().required(),
  rolEmpresa: Joi.string().valid('INTERESADA', 'ALIADA', 'FINANCIADORA').required(),
  canalVinculacion: Joi.string().allow('', null),
  interesConfirmado: Joi.boolean().default(false),
  observaciones: Joi.string().allow('', null)
});

export const updateVinculacionSchema = Joi.object({
  rolEmpresa: Joi.string().valid('INTERESADA', 'ALIADA', 'FINANCIADORA'),
  ndaFirmado: Joi.boolean(),
  ndaFechaFirma: Joi.date().iso(),
  ndaArchivoUrl: Joi.string().uri(),
  cartaIntencionFirmada: Joi.boolean(),
  cartaIntencionFecha: Joi.date().iso(),
  cartaIntencionArchivoUrl: Joi.string().uri(),
  observaciones: Joi.string().allow('', null)
}).min(1);

export const retirarEmpresaSchema = Joi.object({
  motivoRetiro: Joi.string().min(10).required()
});

export const reactivarEmpresaSchema = Joi.object({
  observaciones: Joi.string().allow('', null)
});

export const listEmpresasQuerySchema = Joi.object({
  search: Joi.string().min(3).allow(''),  // 🔥 Mínimo 3 caracteres
  sector: Joi.string(),
  verificada: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

export const listEmpresasDisponiblesQuerySchema = Joi.object({
  search: Joi.string().min(3).allow(''),
  sector: Joi.string(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});