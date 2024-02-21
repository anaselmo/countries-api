import { hash, compare } from 'bcrypt'

export const encrypt = async (passwordPlain: string): Promise<string> => {
  const salt = 11
  const hashPassword = await hash(passwordPlain, salt)
  return hashPassword
}

export const comparePasswords = async (passwordPlain: string, hashPassword: string): Promise<boolean> => {
  return await compare(passwordPlain, hashPassword)
}
