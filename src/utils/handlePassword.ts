/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { hash, compare } from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()

const HASH_SALT = process.env.HASH_SALT!

export const encrypt = async (passwordPlain: string): Promise<string> => {
  return await hash(passwordPlain, HASH_SALT)
}

export const comparePasswords = async (passwordPlain: string, hashPassword: string): Promise<boolean> => {
  return await compare(passwordPlain, hashPassword)
}
