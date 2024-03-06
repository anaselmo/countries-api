/* eslint-disable @typescript-eslint/no-dynamic-delete */
import type { Tourist, Country, Visit } from '@prisma/client'
import type { ICountryOutputDto, ICreateCountryDto, IRawCountryAPI } from '../dtos/countries.dto'
import type { ITouristOutputDto } from '../dtos/tourists.dto'
import type { IVisitOutputDto } from '../dtos/visits.dto'

export const sanitizeData = <T, K extends keyof T>(data: T, ...propertiesToDelete: K[]): Omit<T, K> => {
  const sanitizedData = { ...data }
  propertiesToDelete.forEach(property => delete sanitizedData[property])
  return sanitizedData
}

export const sanitizeTourist = (tourist: Tourist): ITouristOutputDto => {
  return sanitizeData(tourist, 'deleted', 'password')
}

export const sanitizeCountry = (country: Country): ICountryOutputDto => {
  return sanitizeData(country, 'deleted')
}

export const sanitizeVisit = (visit: Visit): IVisitOutputDto => {
  return sanitizeData(visit, 'deleted')
}

export const sanitizeCountryAPI = (country: IRawCountryAPI): ICreateCountryDto => {
  const { abbreviation, name, capital } = country
  return { abbreviation, name, capital }
}
