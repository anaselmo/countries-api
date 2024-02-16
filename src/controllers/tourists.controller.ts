import type { Request, Response } from 'express'
import { prisma } from '../db'
import { TouristService } from '../services/tourists.service'
import type { RegisterTouristDto } from '../dtos/registerTourist.dto'
import type { LoginTouristDto } from '../dtos/loginTourist.dto'
import type { JwtPayloadCustom } from '../utils/handleJwt'
import type { UpdateTouristDto } from '../dtos/updateTourist.dto'

const touristService = new TouristService(prisma)

export const getTourists = async (req: Request, res: Response): Promise<void> => {
  const tourists = await touristService.getTourists()
  res.json(tourists)
}

export const getTourist = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id)
  const tourist = await touristService.getTourist(id)
  res.json(tourist)
}

export const registerTourist = async (req: Request, res: Response): Promise<void> => {
  const { body } = req
  const registeredTourist = await touristService.registerTourist(body as RegisterTouristDto)
  res.json(registeredTourist)
}

export const loginTourist = async (req: Request, res: Response): Promise<void> => {
  const { body } = req
  const loggedTourist = await touristService.loginTourist(body as LoginTouristDto)
  res.json(loggedTourist)
}

export const updateTourist = async (req: Request, res: Response): Promise<void> => {
  const { id } = res.locals.tokenPayload as JwtPayloadCustom
  const { body } = req
  const updatedTourist = await touristService.updateTourist(
    id,
    body as UpdateTouristDto
  )
  res.json(updatedTourist)
}

export const deleteTourist = async (req: Request, res: Response): Promise<void> => {
  const { id } = res.locals.tokenPayload as JwtPayloadCustom
  const hardDelete = req.query.hard === 'true'
  const updatedTourist = await touristService.deleteTourist(
    id,
    hardDelete
  )
  res.json(updatedTourist)
}
