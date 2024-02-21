import { Router } from 'express'
import { createCountry, deleteCountry, getCountries, getCountry, updateCountry } from '../controllers/countries.controller'
import { handleError } from '../utils/handleError'

const router = Router()

router.get('/', handleError(getCountries))

router.get('/:id', handleError(getCountry))

router.post('/', handleError(createCountry))

router.put('/:id', handleError(updateCountry))

router.delete('/:id', handleError(deleteCountry))

export default router
