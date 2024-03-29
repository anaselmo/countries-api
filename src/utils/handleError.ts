import type { Request, Response, NextFunction, RequestHandler } from 'express'

export const outputError = (res: Response, message: string, code: number, error?: unknown): void => {
  console.error(message, error)
  res.status(code).send({ error: message })
}

export const handleError = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => {
  return (async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (err) {
      next(err)
    }
  }) as RequestHandler
}

export class NotFoundError extends Error {
  constructor (msg?: string) {
    super(msg ?? 'RESOURCE_NOT_FOUND')
  }
};

export class UnauthenticatedError extends Error {
  constructor (msg?: string) {
    super(msg ?? 'UNAUNTHENTICATED')
  }
};

export class AlreadyExistsError extends Error {
  constructor (msg?: string) {
    super(msg ?? 'RESOURCE_ALREADY_EXISTS')
  }
};

export class ExternalError extends Error {
  constructor (msg?: string) {
    super(msg ?? 'EXTERNAL_ERROR')
  }
}
