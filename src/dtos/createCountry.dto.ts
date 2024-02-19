import { type Country } from '@prisma/client'

export interface CreateCountryDto {
  abbreviation: Country['abbreviation']
  name: Country['name']
  capital?: Country['capital']
}
