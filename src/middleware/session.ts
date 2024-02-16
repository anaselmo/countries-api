import { Request, Response, NextFunction, RequestHandler } from 'express'
import { outputError } from '../utils/handleError'
import { verifyToken } from '../utils/handleJwt'
import { prisma } from '../db'
// import { JwtPayloadCustom } from "../utils/handleJwt";

export const authMiddleware = (async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      outputError(res, 'YOU_NEED_SESSION', 401); return
    }

    const [, token] = req.headers.authorization.split(' ') // Bearer **<token>**
    if (!token) {
      outputError(res, 'NO_TOKEN', 401); return
    }

    const dataToken = await verifyToken(token)

    if (!dataToken) {
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
