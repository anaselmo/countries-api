import { type Tourist, type Prisma, type Visit, type Country, PrismaClient } from '@prisma/client'
import { type prisma } from '../db'
import { NotFoundError, UnauthenticatedError } from '../utils/handleError'
import { validatorCreateTourist, validatorDeleteTourist, validatorGetTouristById, validatorLoginTourist, validatorUpdateTourist } from '../validators/tourists.validator'
import { comparePasswords, encrypt } from '../utils/handlePassword'
import { tokenSign } from '../utils/handleJwt'
import { validatorCreateVisit, validatorDeleteVisit, validatorGetVisitById, validatorUpdateVisit } from '../validators/visits.validator'
import { validatorGetCountryById } from '../validators/countries.validator'

export interface ITouristService {
  getTourist: (id: Tourist['id']) => Promise<TouristOutputUser>
  getTourists: () => Promise<TouristOutputUser[]>
  updateTourist: (
    id: Tourist['id'],
    data: Prisma.TouristUpdateInput
  ) => Promise<TouristOutputUser>
  deleteTourist: (
    id: Tourist['id'],
    hard?: boolean
  ) => Promise<TouristOutputUser>
  registerTourist: (
    data: Prisma.TouristCreateInput
  ) => Promise<TouristResponse>
  loginTourist: (
    data: TouristLoginInput
  ) => Promise<TouristResponse>
}

// --------------------------------------------------//

// type TouristOutputAdmin = {
//     id: number,
//     name: string | null,
//     email: string,
//     deleted: boolean
// }

interface TouristOutputUser {
  id: number
  name: string | null
  email: string
}

// --------------------------------------------------//

interface TouristLoginInput {
  name: string | null
  email: string
  password: string
}

interface TouristResponse {
  data: TouristOutputUser
  token: string
}

// --------------------------------------------------//

const touristOutputAdmin = {
  id: true,
  name: true,
  email: true,
  deleted: true
}

const touristOutputUser = {
  id: true,
  name: true,
  email: true
}

const visitOutputUser = {
  id: true,
  date: true,
  countryId: true,
  touristId: true
}

// --------------------------------------------------------------------//

export class TouristService implements ITouristService {
  constructor (private readonly repo: typeof prisma) {}

  // --------------------------------------------------//

  public async getTourist (id: Tourist['id']) {
    const tourist = await this.findTouristById(id)
    const { deleted, ...sanitizedTourist } = tourist
    return sanitizedTourist
  }

  // --------------------------------------------------//

  public async getTourists () {
    const tourists = await this.repo.tourist.findMany({
      select: touristOutputAdmin
    })

    if (!tourists) {
      throw new Error('Tourists not found')
    }

    const sanitizedTourists = tourists.map(tourist => {
      const { deleted, ...sanitizedTourist } = tourist
      return sanitizedTourist
    })

    return sanitizedTourists
  }

  // --------------------------------------------------//

  public async updateTourist (id: Tourist['id'], data: Prisma.TouristUpdateInput) {
    await this.findTouristById(id)
    const updatedTourist = await this.repo.tourist.update({
      where: validatorGetTouristById(id),
      data: validatorUpdateTourist(id, data),
      select: touristOutputUser
    })
    return updatedTourist
  }

  // --------------------------------------------------//

  public async deleteTourist (id: Tourist['id'], hard?: boolean) {
    const touristToDelete = await this.repo.tourist.findFirst({
      where: validatorDeleteTourist(id)
    })

    if (!touristToDelete) {
      throw new NotFoundError(`Tourist #${id} not found`)
    } else if (touristToDelete.id !== id) {
      throw new UnauthenticatedError(`You are not authorized to delete Tourist #${touristToDelete.id}`)
    }

    let deletedTourist
    if (hard) {
      await this.repo.visit.deleteMany({
        where: { touristId: id }
      })
      deletedTourist = await this.repo.tourist.delete({
        where: validatorDeleteTourist(id),
        select: touristOutputUser
      })
    } else {
      if (touristToDelete.deleted) {
        throw new UnauthenticatedError(`You do not have permissions to delete Tourist #${id} (soft deleted)`)
      }

      await this.repo.visit.updateMany({
        where: { touristId: id },
        data: { deleted: true }
      })
      deletedTourist = await this.updateTourist(
        id,
        { deleted: true }
      )
    }

    if (!deletedTourist) {
      throw new Error(`Tourist #${id} could not be (soft) deleted`)
    }

    return deletedTourist
  }

  // --------------------------------------------------//

  public async registerTourist (data: Prisma.TouristCreateInput) {
    const { name, email, password } = data

    const touristWithSameEmail = await this.repo.tourist.findUnique({
      where: { email }
    })

    if (touristWithSameEmail) {
      throw new Error(`A tourist with email "${email}" alredy exists`)
    }

    const hashedPassword = await encrypt(password)

    const newTourist = await this.repo.tourist.create({
      data: validatorCreateTourist({
        name,
        email,
        password: hashedPassword
      })
      // select: touristOutputInfo
    })

    if (!newTourist) {
      throw new Error('Tourist could not be registered')
    }

    const token = await tokenSign(newTourist)
    return { data: newTourist, token }
  }

  // --------------------------------------------------//

  public async loginTourist (data: TouristLoginInput) {
    const { email, password } = data
    if (!email) {
      throw new Error('Email is needed to login')
    }
    const loggedTourist = await this.repo.tourist.findUnique({
      where: {
        email,
        deleted: false
      }
    })

    if (!loggedTourist) {
      throw new NotFoundError(`Tourist with email "${email}" not found`)
    }

    if (!password) {
      throw new Error('Password is needed to login')
    }

    const check = await comparePasswords(
      password,
      loggedTourist.password
    )

    if (!check) {
      throw new UnauthenticatedError('Invalid password')
    }

    const token = await tokenSign(loggedTourist)
    return {
      data: loggedTourist, token
    }
  }

  // --------------------------------------------------//

  public async getAllVisits (id: Tourist['id']) {
    await this.findTouristById(id)
    console.log({ id })
    const visits = await this.repo.visit.findMany({
      where: { touristId: id, deleted: false },
      select: visitOutputUser
    })
    if (!visits) {
      throw new NotFoundError(`Tourist #${id} has visited no contries.`)
    }
    return visits
  }

  // --------------------------------------------------//

  public async getVisitsToCountry (touristId: Tourist['id'], countryId: Country['id']) {
    await this.findTouristById(touristId)
    await this.findCountryById(countryId)

    const visitsToCountry = await this.repo.visit.findMany({
      where: { countryId, touristId, deleted: false }
    })
    if (!visitsToCountry) {
      throw new NotFoundError(`Tourist #${touristId} has not visited Country #${countryId}.`)
    }

    return visitsToCountry
  }

  // --------------------------------------------------//

  public async createVisit (touristId: Tourist['id'], countryId: Country['id'], data: Prisma.VisitCreateInput) {
    await this.findTouristById(touristId)
    await this.findCountryById(countryId)

    const { date } = data
    if (date) {
      await this.checkVisitByUnique(date, countryId, touristId)
    }

    const newVisit = await this.repo.visit.create({
      data: {
        ...data,
        country: {
          connect: { id: countryId }
        },
        tourist: {
          connect: { id: touristId }
        }
      },
      select: visitOutputUser
    })
    if (!newVisit) {
      throw new NotFoundError(`Tourist #${touristId} could not create a visit to Country #${countryId}.`)
    }

    return newVisit
  }

  // --------------------------------------------------//

  public async updateVisit (id: Visit['id'], touristId: Tourist['id'], data: { countryId?: number, date?: Date }) {
    await this.findVisitById(id)
    await this.findTouristById(touristId)

    const { countryId } = data
    if (countryId) {
      await this.findCountryById(countryId)
    }

    const { date } = data
    const updatedVisit = await this.repo.visit.update({
      where: validatorGetVisitById(id),
      data: validatorUpdateVisit(
        id,
        {
          country: {
            connect: { id: countryId }
          },
          date
        })
    })
    if (!updatedVisit) {
      throw new NotFoundError(`Tourist #${touristId} could not update the Visit #${id}.`)
    }

    return updatedVisit
  }

  // --------------------------------------------------//
  // TODO: El token sigue funcionando

  public async deleteVisit (id: Visit['id'], touristId: Tourist['id'], hard?: boolean) {
    await this.findTouristById(touristId)

    const visitToDelete = await this.repo.visit.findFirst({
      where: validatorDeleteVisit(id)
    })

    if (!visitToDelete) {
      throw new NotFoundError(`Visit #${id} not found`)
    } else if (visitToDelete.id !== id) {
      throw new UnauthenticatedError(`You are not authorized to delete Visit #${visitToDelete.id}`)
    }

    let deletedVisit
    if (hard) {
      deletedVisit = await this.repo.visit.delete({
        where: validatorGetVisitById(id)
      })
    } else {
      if (visitToDelete.deleted) {
        throw new UnauthenticatedError(`Tourist #${touristId} not authorized: Visit #${id} was soft deleted`)
      }
      deletedVisit = await this.repo.visit.update({
        where: validatorGetVisitById(id),
        data: {
          deleted: true
        }
      })
    }

    if (!deletedVisit) {
      throw new Error(`Visit #${id} could not be (soft) deleted`)
    }

    return deletedVisit
  }

  // --------------------------------------------------//
  // ----------------- PRIVATE METHODS ----------------//
  // --------------------------------------------------//

  private async checkVisitByUnique (date: string | Visit['date'], countryId: number, touristId: number) {
    const visit = await this.repo.visit.findUnique({
      where: {
        date_countryId_touristId: {
          date,
          countryId,
          touristId
        }
      }
    })

    if (visit) {
      throw new Error(`Visit with Country #${countryId}, Tourist #${touristId} and Date:"${date}" already exists`)
    }
  }

  // --------------------------------------------------//

  private async findTouristById (id: Tourist['id']) {
    const tourist = await this.repo.tourist.findFirst({
      where: validatorGetTouristById(id),
      select: touristOutputAdmin
    })

    if (!tourist) {
      throw new NotFoundError(`Tourist #${id} not found`)
    }

    if (tourist.deleted) {
      throw new UnauthenticatedError(`You do not have permissions to access Tourist #${id} (soft deleted)`)
    }

    return tourist
  }

  // --------------------------------------------------//

  private async findCountryById (id: Country['id']) {
    const country = await this.repo.country.findFirst({
      where: validatorGetCountryById(id)
    })

    if (!country) {
      throw new NotFoundError(`Country #${id} not found`)
    } else if (country.deleted) {
      throw new UnauthenticatedError(`You cannot access Country #${id} (soft deleted)`)
    }

    return country
  }

  // --------------------------------------------------//

  private async findVisitById (id: Visit['id']) {
    const visit = await this.repo.visit.findFirst({
      where: validatorGetVisitById(id)
    })

    if (!visit) {
      throw new NotFoundError('Visit not found')
    } else if (visit.deleted) {
      throw new UnauthenticatedError(`You cannot access Visit #${id} (soft deleted)`)
    }

    return visit
  }

  // --------------------------------------------------//
}
