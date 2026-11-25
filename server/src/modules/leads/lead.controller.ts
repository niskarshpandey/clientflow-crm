import type { Request, Response } from 'express'

import {
  createLeadSchema,
  updateLeadSchema,
  leadIdSchema,
  leadQuerySchema
} from './lead.validation'

import * as leadService from './lead.service'

function handleError(error: unknown, res: Response) {
  if (error instanceof leadService.LeadError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message
    })
    return
  }

  console.error('Lead operation failed')

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}

export async function create(req: Request, res: Response) {
  const parsed = createLeadSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid lead data',
      errors: parsed.error.issues
    })
    return
  }

  try {
    const lead = await leadService.createLead(
      res.locals.userId,
      parsed.data
    )

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: lead
    })
  } catch (error) {
    handleError(error, res)
  }
}

export async function list(req: Request, res: Response) {
  const parsed = leadQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors: parsed.error.issues
    })
    return
  }

  try {
    const result = await leadService.getLeads(
      res.locals.userId,
      parsed.data
    )

    res.json({
      success: true,
      data: result.leads,
      pagination: result.pagination
    })
  } catch (error) {
    handleError(error, res)
  }
}

export async function getOne(req: Request, res: Response) {
  const parsed = leadIdSchema.safeParse(req.params.id)

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid lead ID'
    })
    return
  }

  try {
    const lead = await leadService.getLeadById(
      res.locals.userId,
      parsed.data
    )

    res.json({
      success: true,
      data: lead
    })
  } catch (error) {
    handleError(error, res)
  }
}

export async function update(req: Request, res: Response) {
  const id = leadIdSchema.safeParse(req.params.id)
  const body = updateLeadSchema.safeParse(req.body)

  if (!id.success || !body.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid lead ID or update data'
    })
    return
  }

  try {
    const lead = await leadService.updateLead(
      res.locals.userId,
      id.data,
      body.data
    )

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    })
  } catch (error) {
    handleError(error, res)
  }
}

export async function remove(req: Request, res: Response) {
  const parsed = leadIdSchema.safeParse(req.params.id)

  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: 'Invalid lead ID'
    })
    return
  }

  try {
    await leadService.deleteLead(
      res.locals.userId,
      parsed.data
    )

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    })
  } catch (error) {
    handleError(error, res)
  }
}
