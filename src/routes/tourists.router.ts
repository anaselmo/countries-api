import { Router } from 'express'
import { registerTourist, loginTourist, deleteTourist, getTourist, getTourists, updateTourist } from '../controllers/tourists.controller'
import { authMiddleware } from '../middleware/session.middleware'
import { handleError } from '../utils/handleError'

const router = Router()

router.get('/', handleError(getTourists))

router.get('/:id', handleError(getTourist))

router.post('/auth/register', handleError(registerTourist))

router.post('/auth/login', handleError(loginTourist))

router.put('/', authMiddleware, handleError(updateTourist))

router.delete('/', authMiddleware, handleError(deleteTourist))

export default router
