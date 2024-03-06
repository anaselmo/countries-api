import { type NextFunction, type Request, type Response } from 'express'
import { prisma } from '../db'
import { CountryService } from '../services/countries.service'
import type { ICreateCountryDto, IUpdateCountryDto } from '../dtos/countries.dto'

const countryService = new CountryService(prisma)

export const getCountriesAPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.json(await countryService.getExternalCountries())
}

export const createCountriesFromExternalAPI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.json(await countryService.upsertCountriesFromAPI())
}

export const getCountries = async (req: Request, res: Response): Promise<void> => {
  res.json(await countryService.getCountries())
}

export const getCountry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params
  res.json(await countryService.getCountry(Number.parseInt(id)))
}

export const createCountry = async (req: Request, res: Response): Promise<void> => {
  const { body } = req
  res.json(await countryService.createCountry(body as ICreateCountryDto))
}

export const updateCountry = async (req: Request, res: Response): Promise<void> => {
  const { params: { id }, body } = req
  res.json(await countryService.updateCountry(
    Number.parseInt(id),
    body as IUpdateCountryDto
  ))
}

export const deleteCountry = async (req: Request, res: Response): Promise<void> => {
  const { params: { id }, query: { hard } } = req
  res.json(await countryService.deleteCountry(
    Number.parseInt(id),
    hard === 'true'
  ))
}
