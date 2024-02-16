import { type NextFunction, type Request, type Response } from 'express'
import { prisma } from '../db'
import { CountryService } from '../services/countries.service'
import type { CreateCountryDto } from '../dtos/createCountry.dto'
import type { UpdateCountryDto } from '../dtos/updateCountry.dto'

const countryService = new CountryService(prisma)

export const getCountries = async (req: Request, res: Response): Promise<void> => {
  const countries = await countryService.getCountries()
  res.json(countries)
}

export const getCountry = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = parseInt(req.params.id)
  const country = await countryService.getCountry(id)
  res.json(country)
}

export const createCountry = async (req: Request, res: Response): Promise<void> => {
  const { body } = req
  const newCountry = await countryService.createCountry(body as CreateCountryDto)
  res.json(newCountry)
}

export const updateCountry = async (req: Request, res: Response): Promise<void> => {
  const { params: { id }, body } = req
  const updatedCountry = await countryService.updateCountry(Number.parseInt(id), body as UpdateCountryDto)
  res.json(updatedCountry)
}

export const deleteCountry = async (req: Request, res: Response): Promise<void> => {
  const { params: { id }, query: { hard } } = req
  const deletedCountry = await countryService.deleteCountry(Number.parseInt(id), hard === 'true')
  res.json(deletedCountry)
}
