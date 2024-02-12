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
            return res.status(404).send({ error:"COUNTRIES_NOT_FOUND" });
        }

        res.json(countries);
    } catch (err) {
        console.error("An error ocurred while finding all country", err);
        res.status(500).send({ error:"An error ocurred while finding all country" });
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
            return res.status(404).send({ error:"COUNTRY_NOT_FOUND" });
        }

        if (country.deleted) {
            return res.status(402).send({ error:"COUNTRY_SOFT_DELETED" }); //TODO ¿Es 402?
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
        console.error("An error occurred while creating a country", err);
        res.status(500).json({ error: "An error occurred while creating a country" });
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

        if (!updateCountry) {
            return res.send({ error:"FAILED_TO_UPDATE_COUNTRY" });
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
            return res.send( { error: "COUNTRY_NOT_FOUND"});
        }

        res.json(deletedCountry);
    } catch (err) {
        console.error(`An error ocurred while deleting the country with id "${req.params.id}"`, err);
    }
};