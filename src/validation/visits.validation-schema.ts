import * as Joi from 'joi'

export const createVisitSchemaBody = Joi.object({
  countryId: Joi.number().required(),
  date: Joi.date()
})

export const getVisitsToCountrySchemaParams = Joi.object({
  countryId: Joi.number().required()
})

export const updateVisitSchemaParams = Joi.object({
  id: Joi.number()
})

export const updateVisitSchemaBody = Joi.object({
  countryId: Joi.number(),
  date: Joi.date()
})

export const deleteVisitSchemaParams = Joi.object({
  id: Joi.number().required()
})
