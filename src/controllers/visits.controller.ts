import { Request, Response } from "express";
import { prisma } from "../db";
import { validatorCreateVisit, validatorDeleteVisit, validatorUpdateVisit, validatorGetVisitById } from "../validators/visits.validator"
import { handleError } from "../utils/handleError";

/**
 * Obtener la lista de todas las visitas
 * @param req 
 * @param res 
 */
export const getVisits = async (req: Request, res: Response) => {
    try {
        const loggedTourist = res.locals.dataToken;
        if (!loggedTourist) {
            return handleError(res, "COULD_NOT_FIND_LOGGED_TOURIST_IN_RES_LOCALS", 500);
        }

        const visits = await prisma.visit.findMany({
            where: {
                touristId: loggedTourist.id
            }
        });

        if (!visits) {
            return handleError(res, "VISITS_NOT_FOUND" , 404);
        }

        res.json(visits);
    } catch (err) {
        return handleError(res, "An error ocurred while finding all visits" , 500, err);
    }
};

/**
 * Obtener la información de una visita por su id
 * @param req 
 * @param res 
 */
export const getVisit = async (req: Request, res: Response) => {
    try {
        const loggedTourist = res.locals.dataToken;
        if (!loggedTourist) {
            return handleError(res, "COULD_NOT_FIND_LOGGED_TOURIST_IN_RES_LOCALS", 500);
        }
        const touristId = loggedTourist.id;

        const visitId = parseInt(req.params.id);

        const visit = await prisma.visit.findFirst({
            where: {
                id: visitId,
            }
        });

        if (!visit) {
            return handleError(res, "VISIT_NOT_FOUND" , 404);
        } else if (visit.deleted ||visit.touristId !== touristId) {
            return handleError(res, "UNAUTHORIZED", 401);
        }

        res.json(visit);
    } catch (err) {
        return handleError(res,"An error ocurred while finding a visit", 500, err);
    }
};

/**
 * Crear un registro de una visita
 * @param req 
 * @param res 
 */
export const createVisit = async (req: Request, res: Response) => {
    try{
        const loggedTourist = res.locals.dataToken;
        if (!loggedTourist) {
            return handleError(res, "COULD_NOT_FIND_LOGGED_TOURIST_IN_RES_LOCALS", 500);
        }
        const touristId: number = loggedTourist.id;
        const countryId = parseInt(req.params.id);

        let validatedBody = validatorCreateVisit(req.body);

        const newVisit = await prisma.visit.create({
            data: {
                ...validatedBody,
                country: {
                    connect: { id: countryId },
                },
                tourist: {
                    connect: { id: touristId }
                }
            }
        });
        res.json(newVisit);
    } catch (err) {
        return handleError(res, "An error occurred while creating a visit", 500, err);
    }
};

/**
 * Actualizar información de una visita
 * @param req 
 * @param res 
 */
export const updateVisit = async (req: Request, res: Response) => {
    try {
        const loggedTourist = res.locals.dataToken;
        if (!loggedTourist) {
            return handleError(res, "COULD_NOT_FIND_LOGGED_TOURIST_IN_RES_LOCALS", 500);
        }
        const touristId: number = loggedTourist.id;
        const visitId = parseInt(req.params.id);

        const visit = await prisma.visit.findUnique({
            where: { id: visitId },
        });

        if (!visit) {
            return handleError(res, "VISIT_NOT_FOUND", 404);
        } else if (visit.touristId !== touristId) {
            return handleError(res, "UNAUTHORIZED", 401);
        }

        const updatedVisit = await prisma.visit.update({
            where: { id: visitId },
            data: req.body,
        });

        res.json(updatedVisit);
    } catch (err) {
        console.error(`An error ocurred while updating the visit with id "${req.params.id}"`, err);
    }
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
            return handleError(res, "COULD_NOT_FIND_LOGGED_TOURIST_IN_RES_LOCALS", 500);
        }
        const touristId: number = loggedTourist.id;

        const visitId = parseInt(req.params.id); 
        let visitToDelete = await prisma.visit.findFirst({
            where: { 
                id: visitId
            }
        });

        if (!visitToDelete) {
            return handleError(res, "VISIT_NOT_FOUND", 404);
        }  else if (visitToDelete.touristId !== touristId) {
            return handleError(res, "UNAUTHORIZED", 401);
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
            return handleError(res, "VISIT_NOT_FOUND" , 404);
        }

        res.json(deletedVisit);
    } catch (err) {
        console.error(`An error ocurred while deleting the visit with id "${req.params.id}"`, err);
    }
};