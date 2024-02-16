import jwt, { type JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { type Tourist } from '@prisma/client'
dotenv.config()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const JWT_SECRET = process.env.JWT_SECRET!

export type JwtPayloadCustom = (JwtPayload & Tourist)

/**
 * Debes de pasar el objeto del usuario
 * @param user
 * @returns
 */
export const tokenSign = (user: Tourist) => {
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
export const verifyToken = (tokenJwt: string) => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET) as JwtPayloadCustom
  } catch (err) {
    return null
  }
}
