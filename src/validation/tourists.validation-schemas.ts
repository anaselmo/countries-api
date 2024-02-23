import * as Joi from 'joi'

export const createTouristSchemaBody = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  name: Joi.string()
})

export const loginTouristSchemaBody = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required()
})

export const getTouristSchemaParams = Joi.object({
  id: Joi.number().required()
})

export const updateTouristSchemaParams = Joi.object({
  id: Joi.number().required()
})

export const updateTouristSchemaBody = Joi.object({
  email: Joi.string(),
  name: Joi.string()
})

export const deleteTouristSchemaParams = Joi.object({
  id: Joi.number().required()
})
