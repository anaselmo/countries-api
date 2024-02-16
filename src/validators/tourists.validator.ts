import { Prisma, PrismaClient, Tourist } from '@prisma/client'
import { prisma } from '../db'

/**
 *
 * @param dataTourist
 * @returns
 */
export const validatorCreateTourist = (dataTourist: Prisma.TouristCreateInput) => {
  return Prisma.validator<Prisma.TouristCreateInput>()(
    dataTourist
  )
}

/**
 *
 * @param dataTourist
 */
export const validatorLoginTourist = (dataTourist: Prisma.TouristCreateInput) => {
  return Prisma.validator<Prisma.TouristCreateInput>()(
    dataTourist
  )
}

/**
 *
 * @param id
 * @returns
 */
export const validatorGetTouristById = (id: number) => {
  return Prisma.validator<Prisma.TouristWhereUniqueInput>()(
    { id }
  )
}

/**
 *
 * @param id
 * @returns
 */
export const validatorDeleteTourist = (id: number) => {
  return Prisma.validator<Prisma.TouristWhereUniqueInput>()(
    { id }
  )
}

/**
 *
 * @param id
 * @param dataTourist
 * @returns
 */
export const validatorUpdateTourist = (id: number, dataTourist: Prisma.TouristUpdateInput) => {
  return Prisma.validator<Prisma.TouristUpdateInput>()(
    dataTourist
  )
}
