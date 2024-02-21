import type { Visit } from '@prisma/client'

export interface UpdateVisitDto {
  countryId?: Visit['countryId']
  date?: Visit['date']
}
