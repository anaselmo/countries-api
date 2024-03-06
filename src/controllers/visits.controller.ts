import { type Request, type Response } from 'express'
import { prisma } from '../db'
import { TouristService } from '../services/tourists.service'
import type { JwtPayloadCustom } from '../utils/handleJwt'
import type { ICreateVisitDto, IUpdateVisitDto } from '../dtos/visits.dto'

const touristService = new TouristService(prisma)

export const getAllVisits = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  res.json(await touristService.getAllVisits(touristId))
}

export const getVisitsToCountry = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  const { countryId } = req.params
  res.json(await touristService.getVisitsToCountry(
    touristId,
    Number.parseInt(countryId)
  ))
}

export const createVisit = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  const { countryId, date } = req.body as ICreateVisitDto
  res.json(await touristService.createVisit(
    touristId,
    countryId,
    date
  ))
}

export const updateVisit = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  const { body, params: { id } } = req
  res.json(await touristService.updateVisit(
    Number.parseInt(id),
    touristId,
    body as IUpdateVisitDto
  ))
}

export const deleteVisit = async (req: Request, res: Response): Promise<void> => {
  const touristId = (res.locals.tokenPayload as JwtPayloadCustom).id
  const { query: { hard }, params: { id } } = req
  res.json(await touristService.deleteVisit(
    Number.parseInt(id),
    touristId,
    hard === 'true'
  ))
}
