import { Request, Response } from "express";
import { prisma } from "../db";
import { handleError } from "../utils/handleError";
import { validatorCreateTourist, validatorGetTouristById, validatorLoginTourist } from "../validators/tourists.validator";
import { encrypt, comparePasswords } from "../utils/handlePassword";
import { tokenSign } from "../utils/handleJwt";

/**
 * Obtener la lista de todos los países
 * @param req 
 * @param res 
 */
export const getTourists = async (req: Request, res: Response) => {
    try {
        const tourists = await prisma.tourist.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                deleted: true
            }
        });

        if (!tourists) {
            return handleError(res,"TOURISTS_NOT_FOUND", 404);
        }

        res.json(tourists);
    } catch (err) {
        return handleError(res,"An error ocurred while finding all tourists", 500, err);
    }
};

/**
 * Obtener la información de un país por su id
 * @param req 
 * @param res 
 */
export const getTourist = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const tourist = await prisma.tourist.findFirst({
            where: validatorGetTouristById(id),
            select: {
                id: true,
                name: true,
                email: true,
                deleted: true
            }
        });

        if (!tourist) {
            return handleError(res,"TOURIST_NOT_FOUND", 404);
        }

        if (tourist.deleted) {
            return handleError(res,"TOURIST_SOFT_DELETED", 401);
        }

        res.json(tourist);
    } catch (err) {
        return handleError(res,"An error ocurred while finding a tourist", 500, err);
    }
};

/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const registerTourist = async (req: Request, res: Response) => {
    try {
        let validatedBody = validatorCreateTourist(req.body);
        const password = await encrypt(validatedBody.password);
        console.log(`passwordHash=${password}`);
        validatedBody = {...validatedBody, password};

        const registeredTourist = await prisma.tourist.create({
            data: validatedBody
        });
        
        if (!registeredTourist) {
            return handleError(res, "TOURIST_COULD_NOT_BE_REGISTERED", 500);
        }

        const registerOutput = {
            token: await tokenSign(registeredTourist),
            data: registeredTourist
        };

        res.send({ registerOutput });
    } catch (err) {
        return handleError(res, "ERROR_REGISTER_USER", 500, err);
    }
};

/**
 * 
 * @param req 
 * @param res 
 * @returns 
 */
export const loginTourist = async (req: Request, res: Response) => { 
    try{
        let validatedBody = validatorLoginTourist(req.body);
        
        const loggedTourist = await prisma.tourist.findUnique({ 
            where: {
                email: validatedBody.email
            } 
        });

        const users = await prisma.tourist.findMany({});
        console.log({ users });
        
        if (!loggedTourist) {
            return handleError(res, "TOURIST_DOESNT_EXIST", 404);
        }

        const check = await comparePasswords(validatedBody.password, loggedTourist.password);

        if (!check) {
            return handleError(res, "INVALID_PASSWORD", 401);
        }

        const loginOutput = {
            token: await tokenSign(loggedTourist), //min 4:23:38 
            loggedTourist
        };

        res.send({ loginOutput });
    } catch (err) {
        return handleError(res, "ERROR_LOGIN_USER", 500, err);
    }
};

/**
 * Actualizar información de un turista
 * @param req 
 * @param res 
 */
export const updateTourist = async (req: Request, res: Response) => {
    try {
        const updatedTourist = await prisma.tourist.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: req.body,
        });

        // if (!updatedTourist) {
        //     return res.send({ error:"FAILED_TO_UPDATE_TOURIST" });
        // }

        res.json(updatedTourist);
    } catch (err) {
        return handleError(res,`An error ocurred while updating the tourist with id "${req.params.id}"`, 500, err);
    }
};

/**
 * Eliminar un país
 * @param req 
 * @param res 
 */
export const deleteTourist = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id); 
        let touristToDelete = await prisma.tourist.findFirst({
            where: { id }
        });

        if (!touristToDelete) {
            return handleError(res, "TOURIST_NOT_FOUND", 404);
        }

        let deletedTourist;
        if (!req.query.hard) {
            deletedTourist = await prisma.tourist.update({
                where: { id },
                data: {
                    deleted: true,
                }
            })
        } else {
            deletedTourist = await prisma.tourist.delete({
                where: { id }
            });
        }

        if (!deletedTourist) {
            return handleError(res, "TOURIST_NOT_FOUND", 404);
        }

        res.json(deletedTourist);
    } catch (err) {
        return handleError(res, `An error ocurred while deleting the tourist with id "${req.params.id}"`, 500);
    }
};