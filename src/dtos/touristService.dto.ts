import type { Tourist } from '@prisma/client'
import type { RegisterTouristDto } from './registerTourist.dto'
import type { LoginTouristDto } from './loginTourist.dto'
import type { UpdateTouristDto } from './updateTourist.dto'

export interface ITouristService {
  getTourist: (id: Tourist['id']) => Promise<TouristOutputDto>

  getTourists: () => Promise<TouristOutputDto[]>

  updateTourist: (
    id: Tourist['id'],
    data: UpdateTouristDto
  ) => Promise<TouristOutputDto>

  deleteTourist: (
    id: Tourist['id'],
    hard?: boolean
  ) => Promise<TouristOutputDto>

  registerTourist: (data: RegisterTouristDto) => Promise<TouristOutputDto>

  loginTourist: (data: LoginTouristDto) => Promise<string>
}

// TODO: Change to separate file
export interface TouristOutputDto {
  id: number
  name: string | null
  email: string
}
