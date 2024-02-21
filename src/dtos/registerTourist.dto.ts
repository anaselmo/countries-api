import { type Tourist } from '@prisma/client'

export interface RegisterTouristDto {
  name: Tourist['name']
  email: Tourist['email']
  password: Tourist['password']
}
