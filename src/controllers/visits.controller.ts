import { Request, Response } from "express";
import { prisma } from "../db";
import { validatorCreateVisit, validatorDeleteVisit, validatorUpdateVisit, validatorGetVisitById } from "../validators/visits.validator"
import { outputError } from "../utils/handleError";
import { Tourist } from "@prisma/client";
import { TouristService } from "../services/tourists.service";

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

const touristService = new TouristService(prisma);

//--------------------------------------------------------------------//


/**
 * Obtener la lista de todas las visitas de un turista
 * @param req 
 * @param res 
 */
export const getVisits = async (req: Request, res: Response) => {

    const loggedTourist: Tourist = res.locals.dataToken;
    const { id } = loggedTourist;

    const visits = await touristService.getAllVisits(id);
    res.json(visits);
};

/**
 * Obtener todas las visitas de un turista a un pais determinado
 * @param req 
 * @param res 
 */
export const getVisit = async (req: Request, res: Response) => {
    const loggedTourist = res.locals.dataToken;
    const touristId = loggedTourist.id;
    const countryId = parseInt(req.params.id);
    const visit = await touristService.getVisitsToCountry(touristId, countryId);
    res.json(visit);
};

/**
 * Crear un registro de una visita
 * @param req 
 * @param res 
 */
export const createVisit = async (req: Request, res: Response) => {
    const loggedTourist = res.locals.dataToken;
    const touristId = loggedTourist.id;
    console.log(req.body);
    const { countryId, ...data } = req.body;
    const visit = await touristService.createVisit(
        touristId, 
        countryId, 
        data
    );
    res.json(visit);
};

/**
 * Actualizar información de una visita
 * @param req 
 * @param res 
 */
export const updateVisit = async (req: Request, res: Response) => {
    const loggedTourist = res.locals.dataToken;
    const touristId: number = loggedTourist.id;
    const visitId = parseInt(req.params.id);

    // const updatedVisit = await prisma.visit.update({
    //     where: { id: visitId },
    //     data: req.body,
    // });

    console.log({visitId}, {touristId}, {body: req.body})

    const updatedVisit = await touristService.updateVisit(visitId, touristId, req.body);

    res.json(updatedVisit);

};


/**
 * Eliminar una visita
 * @param req 
 * @param res 
 */
export const deleteVisit = async (req: Request, res: Response) => {
    try {
        const loggedTourist = res.locals.dataToken;
        if (!loggedTourist) {
            return outputError(res, "COULD_NOT_FIND_LOGGED_TOURIST_IN_RES_LOCALS", 500);
        }
        const touristId: number = loggedTourist.id;

        const visitId = parseInt(req.params.id); 
        let visitToDelete = await prisma.visit.findFirst({
            where: { 
                id: visitId
            }
        });

        if (!visitToDelete) {
            return outputError(res, "VISIT_NOT_FOUND", 404);
        }  else if (visitToDelete.touristId !== touristId) {
            return outputError(res, "UNAUTHORIZED", 401);
        }

        let deletedVisit;
        if (!req.query.hard) {
            deletedVisit = await prisma.visit.update({
                where: { id: visitId },
                data: {
                    deleted: true,
                }            
            })
        } else {
            deletedVisit = await prisma.visit.delete({
                where: { id: visitId }
            });
        }

        if (!deletedVisit) {
            return outputError(res, "VISIT_NOT_FOUND" , 404);
        }

        res.json(deletedVisit);
    } catch (err) {
        console.error(`An error ocurred while deleting the visit with id "${req.params.id}"`, err);
    }
};