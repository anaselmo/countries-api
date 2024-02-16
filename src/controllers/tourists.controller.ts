import { type Request, type Response } from 'express'
import { prisma } from '../db'
import { TouristService } from '../services/tourists.service'

// --------------------------------------------------------------------//
// --------------------------------------------------------------------//

const touristService = new TouristService(prisma)

// --------------------------------------------------------------------//

/**
 * Obtener la lista de todos los países
 * @param req
 * @param res
 */
export const getTourists = async (req: Request, res: Response) => {
  const tourists = await touristService.getTourists()
  res.json(tourists)
}

// --------------------------------------------------------------------//

/**
 * Obtener la información de un país por su id
 * @param req
 * @param res
 */
export const getTourist = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const tourist = await touristService.getTourist(id)
  res.json(tourist)
}

// --------------------------------------------------------------------//

/**
 * Registrar turista
 * @param req
 * @param res
 * @returns
 */
export const registerTourist = async (req: Request, res: Response) => {
  const registeredTourist = await touristService.registerTourist(req.body)
  res.json(registeredTourist)
}

// --------------------------------------------------------------------//

/**
 * Iniciar sesión de turista
 * @param req
 * @param res
 * @returns
 */
export const loginTourist = async (req: Request, res: Response) => {
  const loggedTourist = await touristService.loginTourist(req.body)
  res.json(loggedTourist)
}

// --------------------------------------------------------------------//

/**
 * Actualizar información de un turista
 * @param req
 * @param res
 */
export const updateTourist = async (req: Request, res: Response) => {
  const loggedTourist = res.locals.dataToken
  const touristId = loggedTourist.id
  const updatedTourist = await touristService.updateTourist(
    touristId,
    req.body
  )
  res.json(updatedTourist)
}

// --------------------------------------------------------------------//

/**
 * Eliminar un país
 * @param req
 * @param res
 */
export const deleteTourist = async (req: Request, res: Response) => {
  const loggedTourist = res.locals.dataToken
  const touristId = loggedTourist.id
  const hardDelete = req.query.hard === 'true'
  const deletedTourist = await touristService.deleteTourist(
    touristId,
    hardDelete
  )
  res.json(deletedTourist)
}

// --------------------------------------------------------------------//
// --------------------------------------------------------------------//
