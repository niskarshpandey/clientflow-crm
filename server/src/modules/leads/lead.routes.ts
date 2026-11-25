import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import * as controller from './lead.controller'

const router = Router()

router.use(authenticate)

router.post('/', controller.create)
router.get('/', controller.list)
router.get('/:id', controller.getOne)
router.patch('/:id', controller.update)
router.delete('/:id', controller.remove)

export default router
