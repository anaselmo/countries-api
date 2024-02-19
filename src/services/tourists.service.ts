import { type Tourist, Prisma, type Visit, type Country } from '@prisma/client'
import type { prisma } from '../db'
import { AlreadyExistsError, NotFoundError, UnauthenticatedError } from '../utils/handleError'
import { comparePasswords, encrypt } from '../utils/handlePassword'
import { tokenSign } from '../utils/handleJwt'
import type { LoginTouristDto } from '../dtos/loginTourist.dto'
import type { ITouristService, TouristOutputDto } from '../dtos/touristService.dto'
import type { UpdateTouristDto } from '../dtos/updateTourist.dto'
import type { VisitOutputDto } from '../dtos/visitOutput.dto'
import { sanitizeData } from '../utils/sanitizeData'
import type { RegisterTouristDto } from '../dtos/registerTourist.dto'
import type { UpdateVisitDto } from '../dtos/updateVisit.dto'

const visitOutputUser = {
  id: true,
  date: true,
  countryId: true,
  touristId: true
}

export class TouristService implements ITouristService {
  constructor (private readonly repo: typeof prisma) {}

  /**
   *
   * @param id
   * @returns
   */
  public async getTourist (id: Tourist['id']): Promise<TouristOutputDto> {
    return sanitizeData(await this.repo.tourist.findFirstOrThrow({
      where: { id, deleted: false }
    }), 'deleted', 'password')
  }

  /**
   *
   * @returns
   */
  public async getTourists (): Promise<TouristOutputDto[]> {
    const tourists = await this.repo.tourist.findMany({
      where: { deleted: false }
    })
    if (tourists.length === 0) throw new NotFoundError('Countries not found')
    return tourists.map(tourist => sanitizeData(tourist, 'deleted', 'password'))
  }

  /**
   *
   * @param id
   * @param data
   * @returns
   */
  public async updateTourist (id: Tourist['id'], data: UpdateTouristDto): Promise<TouristOutputDto> {
    try {
      return sanitizeData(await this.repo.tourist.update({
        where: { id },
        data
      }), 'deleted', 'password')
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        console.log(err.code) // TODO: check the code
      }
      throw err
    }
  }

  /**
   *
   * @param id
   * @param hard
   * @returns
   */
  // TODO: El token sigue funcionando. Crear 'deletedAt' en Tourist para invalidar el token
  public async deleteTourist (id: Tourist['id'], hard?: boolean): Promise<TouristOutputDto> {
    try {
      if (hard === true) {
        return sanitizeData(
          await this.repo.tourist.delete({ where: { id } }),
          'deleted', 'password'
        )
      }

      const updatedTourist = await this.repo.tourist.update({
        where: { id },
        data: { deleted: true }
      })

      // Update the visits to the tourist
      await this.repo.visit.updateMany({
        where: { countryId: id },
        data: { deleted: true }
      })

      return sanitizeData(updatedTourist, 'deleted', 'password')
    } catch (err) {
      // TODO
      throw new Error('TODO')
    }
  }

  /**
   *
   * @param data
   * @returns
   */
  public async registerTourist (data: RegisterTouristDto): Promise<TouristOutputDto> {
    try {
      return sanitizeData(await this.repo.tourist.create({
        data: {
          ...data,
          password: await encrypt(data.password)
        }
      }), 'deleted')
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
   *
   * @param data
   * @returns
   */
  public async loginTourist (data: LoginTouristDto): Promise<string> {
    try {
      const tourist = await this.repo.tourist.findUniqueOrThrow({
        where: {
          email: data.email,
          deleted: false
        }
      })

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
   *
   * @param id
   * @returns
   */
  public async getAllVisits (id: Tourist['id']): Promise<VisitOutputDto[]> {
    // TODO: should i check the tourist exists?
    const visits = await this.repo.visit.findMany({
      where: { touristId: id, deleted: false },
      select: visitOutputUser
    })
    if (visits.length === 0) {
      throw new NotFoundError(`Tourists #${id} has visited no contries.`)
    }
    return visits
  }

  /**
   *
   * @param touristId
   * @param countryId
   * @returns
   */
  public async getVisitsToCountry (touristId: Tourist['id'], countryId: Country['id']): Promise<VisitOutputDto[]> {
    if ((await this.repo.country.findFirst({
      where: {
        id: countryId,
        deleted: false
      }
    })) === null) {
      throw new NotFoundError(`Country #${countryId} not found`)
    }

    const visitsToCountry = await this.repo.visit.findMany({
      where: { countryId, touristId, deleted: false }
    })
    if (visitsToCountry.length === 0) {
      throw new NotFoundError(`Tourist #${touristId} has not visited Country #${countryId}.`)
    }

    return visitsToCountry
  }

  /**
   *
   * @param touristId
   * @param countryId
   * @param date
   * @returns
   */
  public async createVisit (touristId: Tourist['id'], countryId: Country['id'], date: Visit['date'] | undefined): Promise<VisitOutputDto> {
    try {
      return sanitizeData(await this.repo.visit.create({
        data: {
          date,
          country: {
            connect: { id: countryId }
          },
          tourist: {
            connect: { id: touristId }
          }
        }
      }), 'deleted')
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2010') {
          throw new NotFoundError(`Tourist #${touristId} or Country #${countryId} not found`)
        }
      }
      throw err
    }
  }

  /**
   *
   * @param id
   * @param touristId
   * @param data
   * @returns
   */
  public async updateVisit (id: Visit['id'], touristId: Tourist['id'], data: UpdateVisitDto): Promise<VisitOutputDto> {
    const { countryId, date } = data
    const updatedVisit = await this.repo.visit.update({
      where: { id },
      data: {
        country: {
          connect: { id: countryId }
        },
        date
      }
    })

    return updatedVisit
  }

  /**
   *
   * @param id
   * @param touristId
   * @param hard
   * @returns
   */
  public async deleteVisit (id: Visit['id'], touristId: Tourist['id'], hard?: boolean): Promise<VisitOutputDto> {
    if (hard === true) {
      return await this.repo.visit.delete({
        where: { id }
      })
    }

    const updatedVisit = await this.repo.visit.update({
      where: { id },
      data: { deleted: true }
    })

    return sanitizeData(updatedVisit, 'deleted')
  }
}
