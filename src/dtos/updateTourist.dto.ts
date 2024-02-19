import { type Tourist } from '@prisma/client'

export interface UpdateTouristDto {
  name?: Tourist['name']
  email?: Tourist['email']
  // TODO: password
}
