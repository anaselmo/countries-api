import jwt, { type JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { type Tourist } from '@prisma/client'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET ?? 'JWT_SECRET'

export type JwtPayloadCustom = (JwtPayload & Tourist)

/**
 * Debes de pasar el objeto del usuario
 * @param user
 * @returns
 */
export const tokenSign = async (user: Tourist) => {
  const sign = jwt.sign(
    {
      id: user.id
      // role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: '24h'
    }
  )

  return sign
}

/**
 * Debes de pasar el token de sesión (el JWT)
 * @param tokenJwt
 * @returns
 */
export const verifyToken = async (tokenJwt: string) => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET) as JwtPayloadCustom
  } catch (err) {
    return null
  }
}
