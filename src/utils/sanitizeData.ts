import type { Tourist, Country, Visit } from '@prisma/client'
import { type TouristOutputDto } from '../dtos/touristService.dto'
import { type CountryOutputDto } from '../dtos/countryService.dto'
import { type VisitOutputDto } from '../dtos/visitOutput.dto'

export const sanitizeData = <T, K extends keyof T>(data: T, ...propertiesToDelete: K[]): Omit<T, K> => {
  const sanitizedData = { ...data }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  propertiesToDelete.forEach(property => delete sanitizedData[property])
  return sanitizedData
}

export const sanitizeTourist = (tourist: Tourist): TouristOutputDto => {
  return sanitizeData(tourist, 'deleted', 'password')
}

export const sanitizeCountry = (country: Country): CountryOutputDto => {
  return sanitizeData(country, 'deleted')
}

export const sanitizeVisit = (visit: Visit): VisitOutputDto => {
  return sanitizeData(visit, 'deleted')
}
