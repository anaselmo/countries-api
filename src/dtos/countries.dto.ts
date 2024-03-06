import { type Country } from '@prisma/client'

// External API

export interface IRawCountryAPI {
  abbreviation: string
  capital: string
  currency: string
  name: string
  phone: string
  population?: number
  media: IMedia
  id: number
}

export interface IMedia {
  flag: string
  emblem: string
  orthographic: string
}

// My Country

export interface ICreateCountryDto {
  abbreviation: Country['abbreviation']
  name: Country['name']
  capital?: Country['capital']
}

// export type IUpdateCountryDto = Prisma.CountryUpdateInput

export interface IUpdateCountryDto {
  abbreviation?: Country['abbreviation']
  name?: Country['name']
  capital?: Country['capital']
}

export interface ICountryOutputDto {
  id: Country['id']
  abbreviation: Country['abbreviation']
  name: Country['name']
  capital: Country['capital']
}

export interface ICountryService {
  getCountry: (id: Country['id']) => Promise<ICountryOutputDto>
  getCountries: () => Promise<ICountryOutputDto[]>
  updateCountry: (
    id: Country['id'],
    data: IUpdateCountryDto
  ) => Promise<ICountryOutputDto>
  deleteCountry: (
    id: Country['id'],
    hard?: boolean
  ) => Promise<ICountryOutputDto>
  createCountry: (
    data: ICreateCountryDto
  ) => Promise<ICountryOutputDto>
}
