import { Router } from 'express'
import { createCountriesFromExternalAPI, createCountry, deleteCountry, getCountries, getCountriesAPI, getCountry, updateCountry } from '../controllers/countries.controller'
import { handleError } from '../utils/handleError'

const router = Router()

router.get('/', handleError(getCountries))

router.get('/external', handleError(getCountriesAPI))

router.get('/:id', handleError(getCountry))

router.post('/', handleError(createCountry))

router.post('/external', handleError(createCountriesFromExternalAPI))

router.put('/:id', handleError(updateCountry))

router.delete('/:id', handleError(deleteCountry))

export default router
