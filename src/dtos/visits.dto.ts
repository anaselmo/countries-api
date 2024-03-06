import type { Visit } from '@prisma/client'

export interface ICreateVisitDto {
  countryId: Visit['countryId']
  date?: Visit['date']
}

export interface IUpdateVisitDto {
  countryId?: Visit['countryId']
  date?: Visit['date']
}

export interface IVisitOutputDto {
  id: Visit['id']
  countryId: Visit['countryId']
  touristId: Visit['touristId']
  date: Visit['date']
}
