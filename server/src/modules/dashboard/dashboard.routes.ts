import { Router } from 'express'

import {
  authenticate
} from '../../middlewares/auth.middleware'

import {
  getDashboardOverviewController
} from './dashboard.controller'

const router = Router()

router.use(authenticate)

router.get(
  '/overview',
  getDashboardOverviewController
)

export default router
