import type { Request, Response } from 'express'
import { prisma } from '../db'
import { TouristService } from '../services/tourists.service'
import type { JwtPayloadCustom } from '../utils/handleJwt'
import type { IRegisterTouristDto, ILoginTouristDto, IUpdateTouristDto } from '../dtos/tourists.dto'

const touristService = new TouristService(prisma)

export const getTourists = async (req: Request, res: Response): Promise<void> => {
  res.json(await touristService.getTourists())
}

export const getTourist = async (req: Request, res: Response): Promise<void> => {
  res.json(await touristService.getTourist(Number.parseInt(req.params.id)))
}

export const registerTourist = async (req: Request, res: Response): Promise<void> => {
  const { body } = req
  res.json(await touristService.registerTourist(body as IRegisterTouristDto))
}

export const loginTourist = async (req: Request, res: Response): Promise<void> => {
  const { body } = req
  res.json(await touristService.loginTourist(body as ILoginTouristDto))
}

export const updateTourist = async (req: Request, res: Response): Promise<void> => {
  const { id } = res.locals.tokenPayload as JwtPayloadCustom
  const { body } = req
  res.json(await touristService.updateTourist(
    id,
    body as IUpdateTouristDto
  ))
}

export const deleteTourist = async (req: Request, res: Response): Promise<void> => {
  const { id } = res.locals.tokenPayload as JwtPayloadCustom
  const hardDelete = req.query.hard === 'true'
  res.json(await touristService.deleteTourist(
    id,
    hardDelete
  ))
}
