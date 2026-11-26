import type {
  Request,
  Response
} from 'express'

import {
  getDashboardOverview
} from './dashboard.service'

export async function getDashboardOverviewController(
  _req: Request,
  res: Response
) {
  try {
    const ownerId = res.locals.userId

    if (typeof ownerId !== 'string' || !ownerId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      })
    }

    const overview = await getDashboardOverview(ownerId)

    return res.status(200).json({
      success: true,
      data: overview
    })
  } catch (error) {
    console.error('Dashboard overview error:', error)

    return res.status(500).json({
      success: false,
      message: 'Unable to load dashboard analytics'
    })
  }
}
