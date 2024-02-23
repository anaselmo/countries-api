import { type Tourist, Prisma, type Visit, type Country } from '@prisma/client'
import type { prisma } from '../db'
import { AlreadyExistsError, NotFoundError, UnauthenticatedError } from '../utils/handleError'
import { comparePasswords, encrypt } from '../utils/handlePassword'
import { tokenSign } from '../utils/handleJwt'
import type { LoginTouristDto } from '../dtos/loginTourist.dto'
import type { ITouristService, TouristOutputDto } from '../dtos/touristService.dto'
import type { UpdateTouristDto } from '../dtos/updateTourist.dto'
import type { VisitOutputDto } from '../dtos/visitOutput.dto'
import { sanitizeTourist, sanitizeVisit } from '../utils/sanitizeData'
import type { RegisterTouristDto } from '../dtos/registerTourist.dto'
import type { UpdateVisitDto } from '../dtos/updateVisit.dto'

export class TouristService implements ITouristService {
  constructor (private readonly repo: typeof prisma) {}

  /**
   * Get tourist information with id 'id'
   * @param id
   * @returns
   */
  public async getTourist (id: Tourist['id']): Promise<TouristOutputDto> {
    const tourist = await this.repo.tourist.findFirst({
      where: { id, deleted: false }
    })
    if (tourist === null) throw new NotFoundError(`Tourist #${id} not found`)
    return sanitizeTourist(tourist)
  }

  /**
   * Get all the tourists registered
   * @returns
   */
  public async getTourists (): Promise<TouristOutputDto[]> {
    const tourists = await this.repo.tourist.findMany({
      where: { deleted: false }
    })
    if (tourists.length === 0) throw new NotFoundError('Tourists not found')
    return tourists.map(tourist => sanitizeTourist(tourist))
  }

  /**
   * Update tourist information
   * @param id
   * @param data
   * @returns
   */
  public async updateTourist (id: Tourist['id'], data: UpdateTouristDto): Promise<TouristOutputDto> {
    try {
      return sanitizeTourist(await this.repo.tourist.update({
        where: { id },
        data
      }))
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.log({ errorCode: err.code })
        if (err.code === 'P2025') {
          throw new NotFoundError('Tourist not found')
        }
      }
      throw err
    }
  }

  /**
   * Delete tourist
   * @param id
   * @param hard
   * @returns
   */
  public async deleteTourist (id: Tourist['id'], hard?: boolean): Promise<TouristOutputDto> {
    try {
      if (hard === true) {
        return sanitizeTourist(await this.repo.tourist.delete({
          where: { id }
        }))
      }

      console.log({ id })
      const updatedTourist = await this.repo.tourist.update({
        where: { id },
        data: { deleted: true }
      })

      await this.repo.visit.updateMany({
        where: { countryId: id },
        data: { deleted: true }
      })

      return sanitizeTourist(updatedTourist)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.log(err.code)
        if (err.code === 'P2010') {
          throw new NotFoundError(`Tourist with id "#${id}" not found`)
        }
      }
      throw err
    }
  }

  /**
   * Register a tourist in the API
   * @param data
   * @returns
   */
  public async registerTourist (data: RegisterTouristDto): Promise<TouristOutputDto> {
    try {
      return sanitizeTourist(await this.repo.tourist.create({
        data: { ...data, password: await encrypt(data.password) }
      }))
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2010') {
          throw new NotFoundError(`Tourist with email "#${data.email}" not found`)
        }
      }
      throw err
    }
  }

  /**
   * Log a tourist in the API
   * @param data
   * @returns
   */
  public async loginTourist (data: LoginTouristDto): Promise<string> {
    try {
      const tourist = await this.repo.tourist.findUnique({
        where: {
          email: data.email,
          deleted: false
        }
      })

      if (tourist === null) throw new NotFoundError(`Tourist with email "${data.email}" not found`)

      if (!(await comparePasswords(data.password, tourist.password))) {
        throw new UnauthenticatedError('Invalid password')
      }

      return tokenSign(tourist)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new AlreadyExistsError(`A tourist with ${data.email} already exists`)
        }
      }
      throw err
    }
  }

  /**
   * Get all visits of the tourist (bearer of the token)
   * @param touristId
   * @returns
   */
  public async getAllVisits (touristId: Tourist['id']): Promise<VisitOutputDto[]> {
    const visits = await this.repo.visit.findMany({
      where: { touristId, deleted: false }
    })
    if (visits.length === 0) throw new NotFoundError(`Tourist #${touristId} has visited no countries.`)
    return visits.map(visit => sanitizeVisit(visit))
  }

  /**
   * Get all the visits to the country 'countryId' of the tourist (bearer of the token)
   * @param touristId
   * @param countryId
   * @returns
   */
  public async getVisitsToCountry (touristId: Tourist['id'], countryId: Country['id']): Promise<VisitOutputDto[]> {
    const visitsToCountry = await this.repo.visit.findMany({
      where: { countryId, touristId, deleted: false }
    })
    if (visitsToCountry.length === 0) {
      throw new NotFoundError(`Tourist #${touristId} has not visited Country #${countryId}.`)
    }

    return visitsToCountry.map(visit => sanitizeVisit(visit))
  }

  /**
   * Create a visit
   * @param touristId
   * @param countryId
   * @param date
   * @returns
   */
  public async createVisit (touristId: Tourist['id'], countryId: Country['id'], date: Visit['date'] | undefined): Promise<VisitOutputDto> {
    try {
      return sanitizeVisit(await this.repo.visit.create({
        data: {
          date,
          country: {
            connect: { id: countryId }
          },
          tourist: {
            connect: { id: touristId }
          }
        }
      }))
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.log(err.code)
        if (err.code === 'P2010') {
          throw new NotFoundError(`Tourist #${touristId} or Country #${countryId} not found`)
        }
        if (err.code === 'P2025') {
          throw new NotFoundError(`Country #${countryId} not found`)
        }
      }
      throw err
    }
  }

  /**
   * Update a visit
   * @param id
   * @param touristId
   * @param data
   * @returns
   */
  public async updateVisit (id: Visit['id'], touristId: Tourist['id'], data: UpdateVisitDto): Promise<VisitOutputDto> {
    try {
      const { countryId, date } = data
      return sanitizeVisit(await this.repo.visit.update({
        where: { id, touristId },
        data: {
          country: { connect: { id: countryId } },
          date
        }
      }))
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.log({ errorCode: err.code })
        if (err.code === 'P2025') {
          throw new NotFoundError(`-Tourist #${touristId} does not own Visit #${id}- or -Visit/Country not found-`)
        }
      }
      throw err
    }
  }

  /**
   * Deleting a visit
   * @param id
   * @param touristId
   * @param hard
   * @returns
   */
  public async deleteVisit (id: Visit['id'], touristId: Tourist['id'], hard?: boolean): Promise<VisitOutputDto> {
    try {
      if (hard === true) {
        return sanitizeVisit(await this.repo.visit.delete({
          where: { id, touristId }
        }))
      }

      const updatedVisit = await this.repo.visit.update({
        where: { id, touristId },
        data: { deleted: true }
      })

      return sanitizeVisit(updatedVisit)
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.log(err.code)
        if (err.code === 'P2025') {
          throw new NotFoundError('Visit not found')
        }
      }
      throw err
    }
  }
}
