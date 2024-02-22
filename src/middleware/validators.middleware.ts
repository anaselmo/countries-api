import type * as Joi from 'joi'
import type * as express from 'express'

export const countryValidator = (schema: Joi.ObjectSchema, option: 'params' | 'body') => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { error, value } = schema.validate(req[option])

    if (error !== null && error !== undefined) {
      return res.status(422).json({ validationError: error })
    }
    // validation successful
    req[option] = value
    next()
  }
}
