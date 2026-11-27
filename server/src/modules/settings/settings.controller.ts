import { Request, Response } from 'express'

import {
  updateProfileSchema,
  changePasswordSchema,
  updateBusinessProfileSchema
} from './settings.validation'

import * as settingsService from './settings.service'

function handleError(error: unknown, res: Response) {
  if (error instanceof settingsService.SettingsError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message
    })
    return
  }

  console.error('Settings operation failed')

  res.status(500).json({
    success: false,
    message: 'Unable to complete settings operation'
  })
}

function validationError(
  res: Response,
  issues: { path: PropertyKey[]; message: string }[]
) {
  res.status(400).json({
    success: false,
    message: issues[0]?.message || 'Invalid settings data',
    errors: issues.map(issue => ({
      field: issue.path.map(String).join('.'),
      message: issue.message
    }))
  })
}

export async function getProfile(
  _req: Request,
  res: Response
) {
  try {
    const data = await settingsService.getProfile(
      res.locals.userId
    )

    res.json({
      success: true,
      data
    })
  } catch (error) {
    handleError(error, res)
  }
}

export async function updateProfile(
  req: Request,
  res: Response
) {
  try {
    const result = updateProfileSchema.safeParse(req.body)

    if (!result.success) {
      validationError(res, result.error.issues)
      return
    }

    const data = await settingsService.updateProfile(
      res.locals.userId,
      result.data
    )

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data
    })
  } catch (error) {
    handleError(error, res)
  }
}

export async function changePassword(
  req: Request,
  res: Response
) {
  try {
    const result = changePasswordSchema.safeParse(req.body)

    if (!result.success) {
      validationError(res, result.error.issues)
      return
    }

    const data = await settingsService.changePassword(
      res.locals.userId,
      res.locals.tokenVersion,
      result.data
    )

    res.json({
      success: true,
      message: data.message
    })
  } catch (error) {
    handleError(error, res)
  }
}

export async function getBusinessProfile(
  _req: Request,
  res: Response
) {
  try {
    const data = await settingsService.getBusinessProfile(
      res.locals.userId
    )

    res.json({
      success: true,
      data
    })
  } catch (error) {
    handleError(error, res)
  }
}

export async function updateBusinessProfile(
  req: Request,
  res: Response
) {
  try {
    const result =
      updateBusinessProfileSchema.safeParse(req.body)

    if (!result.success) {
      validationError(res, result.error.issues)
      return
    }

    const data = await settingsService.updateBusinessProfile(
      res.locals.userId,
      result.data
    )

    res.json({
      success: true,
      message: 'Business profile saved successfully',
      data
    })
  } catch (error) {
    handleError(error, res)
  }
}
