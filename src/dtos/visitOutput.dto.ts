import { type Visit } from '@prisma/client'

export interface VisitOutputDto {
  id: Visit['id']
  countryId: Visit['countryId']
  touristId: Visit['touristId']
  date: Visit['date']
}
