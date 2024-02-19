import type { Request, Response, NextFunction } from 'express'
import { AlreadyExistsError, NotFoundError, UnauthenticatedError } from '../utils/handleError'

export const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  const DEFAULT_CODE = 500

  let code
  if (err instanceof NotFoundError) code = 404
  else if (err instanceof UnauthenticatedError) code = 401
  else if (err instanceof AlreadyExistsError) code = 409

  res.status(code ?? DEFAULT_CODE)
  res.send(err.message)
}
