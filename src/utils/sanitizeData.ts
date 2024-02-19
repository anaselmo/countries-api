import { type Visit, type Country } from '@prisma/client'
import { type CountryOutputDto } from '../dtos/countryService.dto'
import { type VisitOutputDto } from '../dtos/visitOutput.dto'

export const sanitizeCountry = (countryData: Country): CountryOutputDto => {
  const { deleted, ...sanitizedCountry } = countryData
  return sanitizedCountry
}

export const sanitizeVisit = (visitData: Visit): VisitOutputDto => {
  const { deleted, ...sanitizedVisit } = visitData
  return sanitizedVisit
}

export const sanitizeData = <T, K extends keyof T>(data: T, ...propertiesToDelete: K[]): Omit<T, K> => {
  const sanitizedData = { ...data }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  propertiesToDelete.forEach(property => delete sanitizedData[property])
  return sanitizedData
}
