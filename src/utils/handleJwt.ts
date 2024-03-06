/* eslint-disable @typescript-eslint/no-non-null-assertion */
import jwt, { type JwtPayload } from 'jsonwebtoken'
import dotenv from 'dotenv'
import type { Tourist } from '@prisma/client'
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET!

export type JwtPayloadCustom = (JwtPayload & Pick<Tourist, 'email' | 'id'>)

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

export const verifyToken = (tokenJwt: string): JwtPayloadCustom | null => {
  try {
    return jwt.verify(tokenJwt, JWT_SECRET) as JwtPayloadCustom
  } catch (err) {
    return null
  }
}
