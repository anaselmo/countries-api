import { Router } from 'express'
import validator from '../validation'
import { handleError } from '../utils/handleError'
import {
  createCountriesFromExternalAPI,
  createCountry,
  deleteCountry,
  getCountries,
  getCountriesAPI,
  getCountry,
  updateCountry
} from '../controllers/countries.controller'
import {
  getCountrySchemaParams,
  createCountrySchemaBody,
  updateCountrySchemaParams,
  updateCountrySchemaBody,
  deleteCountrySchemaParams
} from '../validation/countries.validation-schemas'

const router = Router()

router.get('/', handleError(getCountries))

router.get('/external', handleError(getCountriesAPI))

router.get('/:id',
  validator.params(getCountrySchemaParams),
  handleError(getCountry)
)

router.post('/',
  validator.body(createCountrySchemaBody),
  handleError(createCountry)
)

router.post('/external',
  handleError(createCountriesFromExternalAPI)
)

router.put('/:id',
  validator.params(updateCountrySchemaParams),
  validator.body(updateCountrySchemaBody),
  handleError(updateCountry)
)

router.delete('/:id',
  validator.params(deleteCountrySchemaParams),
  handleError(deleteCountry)
)

export default router
