import type { Visit } from '@prisma/client'

export interface CreateVisitDto {
  countryId: Visit['countryId']
  date?: Visit['date']
}
