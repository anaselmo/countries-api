import * as Joi from 'joi'

export const createCountrySchema = Joi.object({
  name: Joi.string().required(),
  abbreviation: Joi.string().required(),
  capital: Joi.string()
})

export const getCountrySchema = Joi.object({
  id: Joi.number().required()
})

export const updateCountrySchema = Joi.object({
  params: Joi.object({
    id: Joi.string().required()
  }),
  body: Joi.object({
    name: Joi.string(),
    abbreviation: Joi.string(),
    capital: Joi.string()
  })
})

export const deleteCountrySchema = Joi.object({
  id: Joi.number().required()
})
