import type { Request, Response } from 'express'

import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
  taskQuerySchema
} from './task.validation'

import {
  TaskError,
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  getProjectTaskSummary
} from './task.service'

function handleError(
  res: Response,
  error: unknown
) {
  if (error instanceof TaskError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    })
  }

  console.error('Task operation failed', error)

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}

export async function createTaskController(
  req: Request,
  res: Response
) {
  const parsed = createTaskSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message
        ?? 'Invalid task data'
    })
  }

  try {
    const task = await createTask(
      res.locals.userId,
      parsed.data
    )

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function getTasksController(
  req: Request,
  res: Response
) {
  const parsed = taskQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message
        ?? 'Invalid query parameters'
    })
  }

  try {
    const result = await getTasks(
      res.locals.userId,
      parsed.data
    )

    return res.json({
      success: true,
      data: result.tasks,
      pagination: result.pagination
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function getTaskController(
  req: Request,
  res: Response
) {
  const parsed = taskIdSchema.safeParse(req.params.id)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID'
    })
  }

  try {
    const task = await getTaskById(
      res.locals.userId,
      parsed.data
    )

    return res.json({
      success: true,
      data: task
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function updateTaskController(
  req: Request,
  res: Response
) {
  const id = taskIdSchema.safeParse(req.params.id)

  if (!id.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID'
    })
  }

  const parsed = updateTaskSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: parsed.error.issues[0]?.message
        ?? 'Invalid task data'
    })
  }

  try {
    const task = await updateTask(
      res.locals.userId,
      id.data,
      parsed.data
    )

    return res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function deleteTaskController(
  req: Request,
  res: Response
) {
  const parsed = taskIdSchema.safeParse(req.params.id)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid task ID'
    })
  }

  try {
    await deleteTask(
      res.locals.userId,
      parsed.data
    )

    return res.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function getProjectTaskSummaryController(
  req: Request,
  res: Response
) {
  const parsed = taskIdSchema.safeParse(
    req.params.projectId
  )

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID'
    })
  }

  try {
    const summary = await getProjectTaskSummary(
      res.locals.userId,
      parsed.data
    )

    return res.json({
      success: true,
      data: summary
    })
  } catch (error) {
    return handleError(res, error)
  }
}
