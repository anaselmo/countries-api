import { Router } from 'express'
import { getAllVisits, getVisitsToCountry, createVisit, updateVisit, deleteVisit } from '../controllers/visits.controller'
import { authMiddleware } from '../middleware/session.middleware'
import { handleError } from '../utils/handleError'

const router = Router()

router.get('/', authMiddleware, handleError(getAllVisits))

router.get('/:countryId', authMiddleware, handleError(getVisitsToCountry))

router.post('/', authMiddleware, handleError(createVisit))

router.put('/:id', authMiddleware, handleError(updateVisit))

router.delete('/:id', authMiddleware, handleError(deleteVisit))

export default router
