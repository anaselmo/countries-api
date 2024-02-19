import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { UnauthenticatedError, outputError } from '../utils/handleError'
import { verifyToken } from '../utils/handleJwt'

export const authMiddleware = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.authorization === null || req.headers.authorization === undefined) {
      throw new UnauthenticatedError('YOU_NEED_SESSION')
    }

    const [, token] = req.headers.authorization.split(' ') // "Bearer" "<token>"
    if (token.length === 0) {
      throw new UnauthenticatedError('NO_TOKEN')
    }
    console.log({ token })

    const tokenPayload = verifyToken(token)
    console.log({ tokenPayload })
    if (tokenPayload === null) {
      throw new UnauthenticatedError('ERROR_TOKEN')
    }

    res.locals.tokenPayload = tokenPayload

    next()
  } catch (err) {
    outputError(res, 'NO_SESSION', 401, err)
  }
}) as RequestHandler<any>
