import { Router } from 'express'
import { getAllVisits, getVisitsToCountry, createVisit, updateVisit, deleteVisit } from '../controllers/visits.controller'
import { authMiddleware } from '../middleware/session.middleware'
import { handleError } from '../utils/handleError'
import validator from '../validation'
import { createVisitSchemaBody, deleteVisitSchemaParams, getVisitsToCountrySchemaParams, updateVisitSchemaBody, updateVisitSchemaParams } from '../validation/visits.validation-schema'

const router = Router()

router.get('/',
  authMiddleware,
  handleError(getAllVisits)
)

router.get('/:countryId',
  authMiddleware,
  validator.params(getVisitsToCountrySchemaParams),
  handleError(getVisitsToCountry)
)

router.post('/',
  authMiddleware,
  validator.body(createVisitSchemaBody),
  handleError(createVisit)
)

router.put('/:id',
  authMiddleware,
  validator.params(updateVisitSchemaParams),
  validator.body(updateVisitSchemaBody),
  handleError(updateVisit)
)

router.delete('/:id',
  authMiddleware,
  validator.params(deleteVisitSchemaParams),
  handleError(deleteVisit)
)

export default router
