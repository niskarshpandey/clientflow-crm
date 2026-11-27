import { Router } from 'express'
import { rateLimit } from 'express-rate-limit'
import { authenticate } from '../../middlewares/auth.middleware'

import {
  getProfile,
  updateProfile,
  changePassword,
  getBusinessProfile,
  updateBusinessProfile
} from './settings.controller'

const router = Router()

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (_req, res) =>
    String(res.locals.userId),
  message: {
    success: false,
    message: 'Too many password change attempts. Try again later.'
  }
})

router.use(authenticate)

router.get('/profile', getProfile)

router.patch('/profile', updateProfile)

router.patch(
  '/password',
  passwordLimiter,
  changePassword
)

router.get('/business', getBusinessProfile)

router.patch('/business', updateBusinessProfile)

export default router
