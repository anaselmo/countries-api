import type { Tourist } from '@prisma/client'

export interface IRegisterTouristDto {
  name: Tourist['name']
  email: Tourist['email']
  password: Tourist['password']
}

export interface ILoginTouristDto {
  email: Tourist['email']
  password: Tourist['password']
}

export interface IUpdateTouristDto {
  name?: Tourist['name']
  email?: Tourist['email']
}

export interface ITouristOutputDto {
  id: number
  name: string | null
  email: string
}

export interface ITouristService {
  getTourist: (id: Tourist['id']) => Promise<ITouristOutputDto>

  getTourists: () => Promise<ITouristOutputDto[]>

  updateTourist: (
    id: Tourist['id'],
    data: IUpdateTouristDto
  ) => Promise<ITouristOutputDto>

  deleteTourist: (
    id: Tourist['id'],
    hard?: boolean
  ) => Promise<ITouristOutputDto>

  registerTourist: (data: IRegisterTouristDto) => Promise<ITouristOutputDto>

  loginTourist: (data: ILoginTouristDto) => Promise<string>
}
