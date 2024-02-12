import { Request, Response } from "express";
import { prisma } from "../db";
import { validatorCreateCountry, validatorGetCountryById } from "../validators/countries.validator"
import { handleError } from "../utils/handleError";

/**
 * Obtener la lista de todos los países
 * @param req 
 * @param res 
 */
export const getCountries = async (req: Request, res: Response) => {
    try {
        const countries = await prisma.country.findMany();

        if (!countries) {
            return handleError(res, "COUNTRIES_NOT_FOUND" , 404);
        }

        res.json(countries);
    } catch (err) {
        return handleError(res, "An error ocurred while finding all country" , 500, err);
    }
};

/**
 * Obtener la información de un país por su id
 * @param req 
 * @param res 
 */
export const getCountry = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const country = await prisma.country.findFirst({
            where: validatorGetCountryById(id)
        });

        if (!country) {
            return handleError(res, "COUNTRY_NOT_FOUND" , 404);
        }

        if (country.deleted) {
            return handleError(res, "COUNTRY_SOFT_DELETED" , 401);
        }

        res.json(country);
    } catch (err) {
        return handleError(res,"An error ocurred while finding a country", 500, err);
    }
};

/**
 * Crear un registro de un país
 * @param req 
 * @param res 
 */
export const createCountry = async (req: Request, res: Response) => {
    try{
        const newCountry = await prisma.country.create({
            data: validatorCreateCountry(req.body)
        });
        res.json(newCountry);
    } catch (err) {
        return handleError(res, "An error occurred while creating a country", 500, err);
    }
};

/**
 * Actualizar información de un país
 * @param req 
 * @param res 
 */
export const updateCountry = async (req: Request, res: Response) => {
    try {
        const updatedCountry = await prisma.country.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: req.body,
        });

        if (!updatedCountry) {
            return handleError(res, "FAILED_TO_UPDATE_COUNTRY", 400);
        }

        res.json(updatedCountry);
    } catch (err) {
        console.error(`An error ocurred while updating the country with id "${req.params.id}"`, err);
    }
};

/**
 * Eliminar un país
 * @param req 
 * @param res 
 */
export const deleteCountry = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id); 
        let countryToDelete = await prisma.country.findFirst({
            where: { id }
        });

        if (!countryToDelete) { 
            return res.status(404).send( { error: "COUNTRY_NOT_FOUND" });
        }

        let deletedCountry;
        if (!req.query.hard) {
            deletedCountry = await prisma.country.update({
                where: { id },
                data: {
                    deleted: true,
                }            
            })
        } else {
            deletedCountry = await prisma.country.delete({
                where: { id }
            });
        }

        if (!deletedCountry) {
            return handleError(res, "COUNTRY_NOT_FOUND" , 404);
        }

        res.json(deletedCountry);
    } catch (err) {
        console.error(`An error ocurred while deleting the country with id "${req.params.id}"`, err);
    }
};