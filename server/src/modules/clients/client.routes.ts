import { Router } from 'express'

import { authenticate } from '../../middlewares/auth.middleware'

import {
  createClient,
  getClients,
  getClientById,
  updateClient,
  deleteClient,
  convertLead
} from './client.controller'

const router = Router()

router.use(authenticate)

router.post('/', createClient)
router.get('/', getClients)

router.post('/convert-lead', convertLead)

router.get('/:id', getClientById)
router.patch('/:id', updateClient)
router.delete('/:id', deleteClient)

export default router
