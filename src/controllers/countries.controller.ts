import { NextFunction, Request, Response } from "express";
import { prisma } from "../db";
import { CountryService } from "../services/countries.service";

//--------------------------------------------------------------------//
//--------------------------------------------------------------------//

const countryService = new CountryService(prisma);

/**
 * Obtener la lista de todos los países
 * @param req 
 * @param res 
 */
export const getCountries = async (req: Request, res: Response) => {
    const countries = await countryService.getCountries();
    res.json(countries);
};

/**
 * Obtener la información de un país por su id
 * @param req 
 * @param res 
 */
export const getCountry = async (req: Request, res: Response, next: NextFunction) => {
    const id = parseInt(req.params.id);
    const country = await countryService.getCountry(id);
    res.json(country);  
};

/**
 * Crear un registro de un país
 * @param req 
 * @param res 
 */
export const createCountry = async (req: Request, res: Response) => {
    const newCountry = await countryService.createCountry((req.body));
    res.json(newCountry);
};

/**
 * Actualizar información de un país
 * @param req 
 * @param res 
 */
export const updateCountry = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const updatedCountry = await countryService.updateCountry(id, req.body)
    res.json(updatedCountry);

};

/**
 * Eliminar un país
 * @param req 
 * @param res 
 */
export const deleteCountry = async (req: Request, res: Response) => {
    const id = parseInt(req.params.id); 
    const hardDelete = req.query.hard === 'true';
    const deletedCountry = await countryService.deleteCountry(id, hardDelete);
    res.json(deletedCountry);
};