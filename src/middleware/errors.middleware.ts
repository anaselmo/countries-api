import { type Request, type Response, type NextFunction } from 'express'
import { NotFoundError, UnauthenticatedError } from '../utils/handleError'

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof NotFoundError) {
    res.status(404)
  } else if (err instanceof UnauthenticatedError) {
    res.status(401)
  } else {
    res.status(500)
  }

  res.send(err.message)
}
