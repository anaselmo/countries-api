import type { Country } from '@prisma/client'
import type { CreateCountryDto } from './createCountry.dto'
import type { UpdateCountryDto } from './updateCountry.dto'

export interface ICountryService {
  getCountry: (id: Country['id']) => Promise<CountryOutputDto>
  getCountries: () => Promise<CountryOutputDto[]>
  updateCountry: (
    id: Country['id'],
    data: UpdateCountryDto
  ) => Promise<CountryOutputDto>
  deleteCountry: (
    id: Country['id'],
    hard?: boolean
  ) => Promise<CountryOutputDto>
  createCountry: (
    data: CreateCountryDto
  ) => Promise<CountryOutputDto>
}

export interface CountryOutputDto {
  id: Country['id']
  abbreviation: Country['abbreviation']
  name: Country['name']
  capital: Country['capital']
}
