export interface RawCountryAPI {
  abbreviation: string
  capital: string
  currency: string
  name: string
  phone: string
  population?: number
  media: Media
  id: number
}

export interface Media {
  flag: string
  emblem: string
  orthographic: string
}
