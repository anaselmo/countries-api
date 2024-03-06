import axios, { type AxiosInstance } from 'axios'
import { ExternalError } from '../utils/handleError'
// import { type IRawCountryAPI } from '../dtos/countryAPI.dto'
import type { IRawCountryAPI } from '../dtos/countries.dto'

export class ExternalService {
  private readonly axios: AxiosInstance

  constructor (baseURL: string) {
    this.axios = axios.create({ baseURL })
  }

  public async getData (url: string): Promise<IRawCountryAPI[]> {
    try {
      return (await this.axios.get(url)).data
    } catch (err) {
      throw new ExternalError('An error ocurred while trying to fetch data from external service')
    }
  }
}
