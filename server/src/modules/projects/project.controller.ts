import type { Request, Response } from 'express'

import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
  projectQuerySchema
} from './project.validation'

import * as service from './project.service'

function handleError(
  error: unknown,
  res: Response
) {
  if (error instanceof service.ProjectError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    })
  }

  console.error('Project module error:', error)

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}

export async function createProject(
  req: Request,
  res: Response
) {
  const parsed = createProjectSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project data',
      errors: parsed.error.issues
    })
  }

  try {
    const project = await service.createProject(
      res.locals.userId,
      parsed.data
    )

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project
    })
  } catch (error) {
    return handleError(error, res)
  }
}

export async function getProjects(
  req: Request,
  res: Response
) {
  const parsed = projectQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors: parsed.error.issues
    })
  }

  try {
    const result = await service.getProjects(
      res.locals.userId,
      parsed.data
    )

    return res.status(200).json({
      success: true,
      data: result.projects,
      pagination: result.pagination
    })
  } catch (error) {
    return handleError(error, res)
  }
}

export async function getProjectById(
  req: Request,
  res: Response
) {
  const parsed = projectIdSchema.safeParse(req.params.id)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID'
    })
  }

  try {
    const project = await service.getProjectById(
      res.locals.userId,
      parsed.data
    )

    return res.status(200).json({
      success: true,
      data: project
    })
  } catch (error) {
    return handleError(error, res)
  }
}

export async function updateProject(
  req: Request,
  res: Response
) {
  const id = projectIdSchema.safeParse(req.params.id)
  const parsed = updateProjectSchema.safeParse(req.body)

  if (!id.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID'
    })
  }

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project update data',
      errors: parsed.error.issues
    })
  }

  try {
    const project = await service.updateProject(
      res.locals.userId,
      id.data,
      parsed.data
    )

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    })
  } catch (error) {
    return handleError(error, res)
  }
}

export async function deleteProject(
  req: Request,
  res: Response
) {
  const parsed = projectIdSchema.safeParse(req.params.id)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid project ID'
    })
  }

  try {
    await service.deleteProject(
      res.locals.userId,
      parsed.data
    )

    return res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    return handleError(error, res)
  }
}
