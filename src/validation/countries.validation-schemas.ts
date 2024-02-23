import * as Joi from 'joi'

export const createCountrySchemaBody = Joi.object({
  name: Joi.string().required(),
  abbreviation: Joi.string().required(),
  capital: Joi.string()
})

export const getCountrySchemaParams = Joi.object({
  id: Joi.number().required()
})

export const updateCountrySchemaParams = Joi.object({
  id: Joi.number().required()
})

export const updateCountrySchemaBody = Joi.object({
  name: Joi.string(),
  abbreviation: Joi.string(),
  capital: Joi.string()
})

export const deleteCountrySchemaParams = Joi.object({
  id: Joi.number().required()
})
