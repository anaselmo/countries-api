import { Prisma, type Country } from '@prisma/client'
import { prisma } from '../db'
import { NotFoundError, UnauthenticatedError } from '../utils/handleError'
import { validatorCreateCountry, validatorDeleteCountry, validatorGetCountryByAbbreviation, validatorGetCountryById, validatorGetCountryByName, validatorUpdateCountry } from '../validators/countries.validator'
import { type CreateCountryDto } from '../dtos/createCountry.dto'
import type { UpdateCountryDto } from '../dtos/updateCountry.dto'

// --------------------------------------------------------------------//
// --------------------------------------------------------------------//

export interface ICountryService {
  getCountry: (id: Country['id']) => Promise<CountryOutputUser>
  getCountries: () => Promise<CountryOutputUser[]>
  updateCountry: (
    id: Country['id'],
    data: UpdateCountryDto
  ) => Promise<CountryOutputUser>
  deleteCountry: (
    id: Country['id'],
    hard?: boolean
  ) => Promise<CountryOutputUser>
  createCountry: (
    data: Prisma.CountryCreateInput
  ) => Promise<CountryOutputUser>
}

// --------------------------------------------------//

const countryOutputAdmin = {
  id: true,
  abbreviation: true,
  name: true,
  capital: true,
  deleted: true
}

// --------------------------------------------------//

interface CountryOutputUser {
  id: Country['id']
  abbreviation: Country['abbreviation']
  name: Country['name']
  capital: Country['capital']
}

const countryOutputUser = {
  id: true,
  abbreviation: true,
  name: true,
  capital: true
}

// --------------------------------------------------------------------//

export class CountryService implements ICountryService {
  constructor (private readonly repo: typeof prisma) {} // tb Prisma

  // --------------------------------------------------//

  private async findCountryById (id: Country['id']) {
    const country = await this.repo.country.findFirst({
      where: validatorGetCountryById(id)
    })

    if (country === null) {
      throw new NotFoundError(`Country #${id} not found`)
    } else if (country.deleted) {
      throw new UnauthenticatedError(`You cannot access Country #${id} (soft deleted)`)
    }

    return country
  }

  // --------------------------------------------------//
  public async getCountry (id: Country['id']) {
    const { deleted, ...sanitizedCountry } = await this.findCountryById(id)
    return sanitizedCountry
  }

  // --------------------------------------------------//

  public async getCountries () {
    const countries = await this.repo.country.findMany({
      where: {
        deleted: false
      }
    })

    if (countries.length === 0) throw new Error('Countries not found')
    return countries.map(({ deleted, ...sanitizedCountry }) => sanitizedCountry)
  }

  // --------------------------------------------------//

  public async updateCountry (id: Country['id'], data: UpdateCountryDto): Promise<CountryOutputUser> {
    try {
      await this.findCountryById(id)
      // TODO: Wrap in  a try catch like create method
      return await this.repo.country.update({
        where: validatorGetCountryById(id),
        data,
        select: countryOutputUser
      })
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          // TODO: Create a custom error, throw here and properly handle it in the middleware
          throw new Error('Error in updateCountry')
        }
      }
      throw err
    }
  }

  // --------------------------------------------------//

  public async deleteCountry (id: Country['id'], hard: boolean = false) {
    // let deletedCountry
    // if (hard) {
    //   await prisma.visit.deleteMany({
    //     where: { countryId: id }
    //   })
    //   deletedCountry = await prisma.country.delete({
    //     where: validatorDeleteCountry(id),
    //     select: countryOutputUser
    //   })
    // } else {
    //   if (countryToDelete.deleted) {
    //     throw new UnauthenticatedError(`You do not have permissions to delete Country #${id} (soft delete)`)
    //   }
    //   deletedCountry = await this.updateCountry(id, { deleted: true })
    // }

    // if (!deletedCountry) {
    //   throw new Error(`Country #${id} could not be (soft) deleted`)
    // }

    // return deletedCountry


    if (hard) {
      return this.repo.country.delete({
        where: validatorDeleteCountry(id),
        select: countryOutputUser
      });
    } else {
      const updatedCountry = await this.repo.country.update({
        where: validatorGetCountryById(id),
        data: { deleted: true },
        select: countryOutputUser
      })

      // Update the visits to the country
      await this.repo.visit.updateMany({
        where: { countryId: id },
        data: { deleted: true }
      })

      return updatedCountry
    }
  }

  // --------------------------------------------------//

  public async createCountry (data: CreateCountryDto): Promise<Country> {
    try {
      const newCountry = await this.repo.country.create({
        data: validatorCreateCountry(data)
      })
      return newCountry
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          // TODO: Create a custom error (AlreadyExistsError), throw here and properly handle it in the middleware
          throw new Error(`Country with name "${data.name}" or abbreviation "${data.abbreviation}" already exists`)
        }
      }
      throw err
    }
  }
}
