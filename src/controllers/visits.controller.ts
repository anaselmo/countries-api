import { type Request, type Response } from 'express'
import { prisma } from '../db'
import { TouristService } from '../services/tourists.service'
import type { JwtPayloadCustom } from '../utils/handleJwt'
import type { CreateVisitDto } from '../dtos/createVisit.dto'
import type { UpdateVisitDto } from '../dtos/updateVisit.dto'

const touristService = new TouristService(prisma)

export const getAllVisits = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  const visits = await touristService.getAllVisits(touristId)
  res.json(visits)
}

export const getVisitsToCountry = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  const { countryId } = req.params
  const visit = await touristService.getVisitsToCountry(
    touristId,
    Number.parseInt(countryId)
  )
  res.json(visit)
}

export const createVisit = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  const { countryId, date } = req.body as CreateVisitDto
  const visit = await touristService.createVisit(
    touristId,
    countryId,
    date
  )
  res.json(visit)
}

export const updateVisit = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  const { body, params: { id } } = req
  const updatedVisit = await touristService.updateVisit(
    Number.parseInt(id),
    touristId,
    body as UpdateVisitDto
  )
  res.json(updatedVisit)
}

export const deleteVisit = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  const { query: { hard }, params: { id } } = req
  const deletedVisit = await touristService.deleteVisit(
    Number.parseInt(id),
    touristId,
    hard === 'true'
  )
  res.json(deletedVisit)
}
