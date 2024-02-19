import { Prisma, type Country } from '@prisma/client'
import type { prisma } from '../db'
import { AlreadyExistsError, NotFoundError } from '../utils/handleError'
import type { CreateCountryDto } from '../dtos/createCountry.dto'
import type { UpdateCountryDto } from '../dtos/updateCountry.dto'
import type { CountryOutputDto, ICountryService } from '../dtos/countryService.dto'
import { sanitizeCountry } from '../utils/sanitizeData'

export class CountryService implements ICountryService {
  constructor (private readonly repo: typeof prisma) {}

  public async getCountry (id: Country['id']): Promise<CountryOutputDto> {
    // TODO: try catch?
    return sanitizeCountry(await this.repo.country.findFirstOrThrow({
      where: { id, deleted: false }
    }))
  }

  public async getCountries (): Promise<CountryOutputDto[]> {
    // TODO: try catch?
    const countries = await this.repo.country.findMany({
      where: {
        deleted: false
      }
    })

    if (countries.length === 0) throw new Error('Countries not found')
    return countries.map(country => sanitizeCountry(country))
  }

  public async updateCountry (id: Country['id'], data: UpdateCountryDto): Promise<CountryOutputDto> {
    try {
      return sanitizeCountry(await this.repo.country.update({
        where: { id },
        data
      }))
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2010') {
          throw new NotFoundError(`Country with id "#${id}" not found`)
        }
      }
      throw err
    }
  }

  public async deleteCountry (id: Country['id'], hard: boolean = false): Promise<CountryOutputDto> {
    if (hard) {
      return sanitizeCountry(await this.repo.country.delete({
        where: { id }
      }))
    }

    const updatedCountry = await this.repo.country.update({
      where: { id },
      data: { deleted: true }
    })

    await this.repo.visit.updateMany({
      where: { countryId: id },
      data: { deleted: true }
    })

    return sanitizeCountry(updatedCountry)
  }

  public async createCountry (data: CreateCountryDto): Promise<CountryOutputDto> {
    try {
      return sanitizeCountry(await this.repo.country.create({
        data
      }))
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new AlreadyExistsError(`Country with name "${data.name}" or abbreviation "${data.abbreviation}" already exists`)
        }
      }
      throw err
    }
  }
}
