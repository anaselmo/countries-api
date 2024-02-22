import { Router } from 'express'
import { createCountriesFromExternalAPI, createCountry, deleteCountry, getCountries, getCountriesAPI, getCountry, updateCountry } from '../controllers/countries.controller'
import { handleError } from '../utils/handleError'
import { getCountrySchema, createCountrySchema, updateCountrySchema } from '../validation-schemas/countries.validation-schemas'
import { countryValidator } from '../middleware/validators.middleware'

const router = Router()

router.get('/', handleError(getCountries))

router.get('/external', handleError(getCountriesAPI))

router.get('/:id', countryValidator(getCountrySchema, 'params'), handleError(getCountry))

router.post('/', countryValidator(createCountrySchema, 'body'), handleError(createCountry))

router.post('/external', handleError(createCountriesFromExternalAPI))

router.put('/:id', countryValidator(updateCountrySchema, 'body'), countryValidator(updateCountrySchema, 'params'), handleError(updateCountry))

router.delete('/:id', handleError(deleteCountry))

export default router
