import type { Tourist } from '@prisma/client'

export interface LoginTouristDto {
  email: Tourist['email']
  password: Tourist['password']
}
