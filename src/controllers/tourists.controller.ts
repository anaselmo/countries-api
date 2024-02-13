import { Request, Response } from "express";
import { prisma } from "../db";
import { TouristService } from "../services/tourists.service";

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

const touristService = new TouristService(prisma.tourist);

/**
 * Obtener la lista de todos los países
 * @param req 
 * @param res 
 */
export const getTourists = async (req: Request, res: Response) => {
    const tourists = await touristService.getTourists();
    res.json(tourists);
};

/**
 * Obtener la información de un país por su id
 * @param req 
 * @param res 
 */
export const getTourist = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const tourist = await touristService.getTourist(id);
    res.json(tourist);
};

/**
 * Registrar turista
 * @param req 
 * @param res 
 * @returns 
 */
export const registerTourist = async (req: Request, res: Response) => {
    const registeredTourist = await touristService.registerTourist(req.body);
    res.send(registeredTourist);
};

/**
 * Iniciar sesión de turista
 * @param req 
 * @param res 
 * @returns 
 */
export const loginTourist = async (req: Request, res: Response) => {     
    const loggedTourist = await touristService.loginTourist(req.body);
    res.send(loggedTourist);
};

/**
 * Actualizar información de un turista
 * @param req 
 * @param res 
 */
export const updateTourist = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const updatedTourist = await touristService.updateTourist(id, req.body);
    res.json(updatedTourist);
};

/**
 * Eliminar un país
 * @param req 
 * @param res 
 */
export const deleteTourist = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const deletedTourist = await touristService.deleteTourist(id);
    res.json(deletedTourist);
};