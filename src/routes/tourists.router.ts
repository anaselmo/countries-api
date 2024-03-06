import { Router } from 'express'
import { authMiddleware } from '../middleware/session.middleware'
import { handleError } from '../utils/handleError'
import validator from '../validation'
import {
  registerTourist,
  loginTourist,
  deleteTourist,
  getTourist,
  getTourists,
  updateTourist
} from '../controllers/tourists.controller'
import {
  createTouristSchemaBody,
  getTouristSchemaParams,
  loginTouristSchemaBody,
  updateTouristSchemaBody
} from '../validation/tourists.validation-schemas'

const router = Router()

router.get('/',
  handleError(getTourists)
)

router.get('/:id',
  validator.params(getTouristSchemaParams),
  handleError(getTourist)
)

router.post('/auth/register',
  validator.body(createTouristSchemaBody),
  handleError(registerTourist)
)

router.post('/auth/login',
  validator.body(loginTouristSchemaBody),
  handleError(loginTourist)
)

router.put('/',
  authMiddleware,
  validator.body(updateTouristSchemaBody),
  handleError(updateTourist)
)

router.delete('/',
  authMiddleware,
  handleError(deleteTourist)
)

export default router
