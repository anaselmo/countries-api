import type { Request, Response, NextFunction, RequestHandler } from 'express'
import { outputError } from '../utils/handleError'
import { verifyToken } from '../utils/handleJwt'
import { prisma } from '../db'

export const authMiddleware = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.authorization === null || req.headers.authorization === undefined) {
      outputError(res, 'YOU_NEED_SESSION', 401); return
    }

    const [, token] = req.headers.authorization.split(' ') // "Bearer" "<token>"
    if (token.length === 0) {
      outputError(res, 'NO_TOKEN', 401); return
    }

    const dataToken = verifyToken(token)

    if (dataToken === null) {
      outputError(res, 'ERROR_TOKEN', 401); return
    }

    const user = await prisma.tourist.findUnique({
      where: {
        id: dataToken.id
      }
    })

    res.locals.user = user
    res.locals.dataToken = dataToken

    next()
  } catch (err) {
    outputError(res, 'NO_SESSION', 401)
  }
}) as RequestHandler<any>
