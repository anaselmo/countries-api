import { hash, compare } from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

export const encrypt = async (passwordPlain: string): Promise<string> => {
  const HASH_SALT = process.env.HASH_SALT ?? 'DEFAULT_SALT'
  return await hash(passwordPlain, HASH_SALT)
}

export const comparePasswords = async (passwordPlain: string, hashPassword: string): Promise<boolean> => {
  return await compare(passwordPlain, hashPassword)
}
