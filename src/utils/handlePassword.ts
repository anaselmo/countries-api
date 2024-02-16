import { hash, compare } from 'bcrypt'
import { Tourist } from '@prisma/client'

/**
 * Contraseña sin encriptar
 * @param passwordPlain
 */
export const encrypt = async (passwordPlain: string) => {
  const salt = 11
  const hashPassword = await hash(passwordPlain, salt)
  return hashPassword
}

/**
 *
 * @param passwordPlain
 * @param hashPassword
 * @returns
 */
export const comparePasswords = async (passwordPlain: string, hashPassword: string) => {
  return await compare(passwordPlain, hashPassword)
}

/**
 * Exclude keys from user
 * @param user
 * @param keys
 * @returns
 */
// export const exclude = <Tourist, Key extends keyof Tourist>(
//     user: Tourist,
//     keys: Key[]
// ): Omit<Tourist, Key>  => {
//     return Object.fromEntries(
//       Object.entries(user).filter(([key]) => !keys.includes(key as string))
//     ) as Omit<Tourist, Key>;
// };
