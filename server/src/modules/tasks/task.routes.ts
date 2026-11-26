import { Router } from 'express'

import { authenticate } from '../../middlewares/auth.middleware'

import {
  createTaskController,
  getTasksController,
  getTaskController,
  updateTaskController,
  deleteTaskController,
  getProjectTaskSummaryController
} from './task.controller'

const router = Router()

router.use(authenticate)

router.post('/', createTaskController)

router.get('/', getTasksController)

router.get(
  '/project/:projectId/summary',
  getProjectTaskSummaryController
)

router.get('/:id', getTaskController)

router.patch('/:id', updateTaskController)

router.delete('/:id', deleteTaskController)

export default router
