import { type Request, type Response } from 'express'
import { prisma } from '../db'
import { type Tourist } from '@prisma/client'
import { TouristService } from '../services/tourists.service'

// --------------------------------------------------------------------//
// --------------------------------------------------------------------//

const touristService = new TouristService(prisma)

// --------------------------------------------------------------------//

/**
 * Obtener la lista de todas las visitas de un turista
 * @param req
 * @param res
 */
export const getAllVisits = async (req: Request, res: Response) => {
  const loggedTourist: Tourist = res.locals.dataToken
  const touristId = loggedTourist.id
  const visits = await touristService.getAllVisits(touristId)
  res.json(visits)
}

// --------------------------------------------------------------------//

/**
 * Obtener todas las visitas de un turista a un pais determinado
 * @param req
 * @param res
 */
export const getVisitsToCountry = async (req: Request, res: Response) => {
  const loggedTourist = res.locals.dataToken
  const touristId = loggedTourist.id
  const countryId = parseInt(req.params.countryId)
  const visit = await touristService.getVisitsToCountry(
    touristId,
    countryId
  )
  res.json(visit)
}

// --------------------------------------------------------------------//

/**
 * Crear un registro de una visita
 * @param req
 * @param res
 */
export const createVisit = async (req: Request, res: Response) => {
  const loggedTourist = res.locals.dataToken
  const touristId = loggedTourist.id
  console.log(req.body)
  const { countryId, ...data } = req.body
  const visit = await touristService.createVisit(
    touristId,
    countryId,
    data
  )
  res.json(visit)
}

// --------------------------------------------------------------------//

/**
 * Actualizar información de una visita
 * @param req
 * @param res
 */
export const updateVisit = async (req: Request, res: Response) => {
  const loggedTourist = res.locals.dataToken
  const touristId: number = loggedTourist.id
  const visitId = parseInt(req.params.id)
  const updatedVisit = await touristService.updateVisit(
    visitId,
    touristId,
    req.body
  )
  res.json(updatedVisit)
}

// --------------------------------------------------------------------//

/**
 * Eliminar una visita
 * @param req
 * @param res
 */
export const deleteVisit = async (req: Request, res: Response) => {
  const loggedTourist = res.locals.dataToken
  const touristId: number = loggedTourist.id
  const visitId = parseInt(req.params.id)
  const hardDelete = req.query.hard === 'true'
  const deletedVisit = await touristService.deleteVisit(
    visitId,
    touristId,
    hardDelete
  )
  res.json(deletedVisit)
}

// --------------------------------------------------------------------//
// --------------------------------------------------------------------//
