import jwt, { type JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import type { Tourist } from '@prisma/client'
dotenv.config()

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const JWT_SECRET = process.env.JWT_SECRET!

export type JwtPayloadCustom = (JwtPayload & Pick<Tourist, 'email' | 'id'>)

/**
 * Debes de pasar el objeto del usuario
 * @param user
 * @returns
 */
export const tokenSign = (user: Pick<Tourist, 'email' | 'id'>): string => {
  return jwt.sign(
    {
      email: user.email,
      sub: user.id, // submiter
      id: user.id
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

/**
 * Debes de pasar el token de sesión (el JWT)
 * @param tokenJwt
 * @returns
 */
export const verifyToken = (tokenJwt: string): JwtPayloadCustom | null => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET) as JwtPayloadCustom
  } catch (err) {
    return null
  }
}
