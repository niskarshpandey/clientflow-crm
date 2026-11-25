import type { Request, Response } from 'express'

import {
  createClientSchema,
  updateClientSchema,
  clientIdSchema,
  clientQuerySchema,
  convertLeadSchema
} from './client.validation'

import * as service from './client.service'

function handleError(res: Response, error: unknown) {
  if (error instanceof service.ClientError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message
    })
  }

  console.error('Client module operation failed')

  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
}

export async function createClient(
  req: Request,
  res: Response
) {
  const parsed = createClientSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid client data',
      errors: parsed.error.issues
    })
  }

  try {
    const client = await service.createClient(
      res.locals.userId,
      parsed.data
    )

    return res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function getClients(
  req: Request,
  res: Response
) {
  const parsed = clientQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      errors: parsed.error.issues
    })
  }

  try {
    const result = await service.getClients(
      res.locals.userId,
      parsed.data
    )

    return res.json({
      success: true,
      data: result.clients,
      pagination: result.pagination
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function getClientById(
  req: Request,
  res: Response
) {
  const parsed = clientIdSchema.safeParse(req.params.id)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid client ID'
    })
  }

  try {
    const client = await service.getClientById(
      res.locals.userId,
      parsed.data
    )

    return res.json({
      success: true,
      data: client
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function updateClient(
  req: Request,
  res: Response
) {
  const id = clientIdSchema.safeParse(req.params.id)
  const body = updateClientSchema.safeParse(req.body)

  if (!id.success || !body.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid client ID or update data',
      errors: body.success ? [] : body.error.issues
    })
  }

  try {
    const client = await service.updateClient(
      res.locals.userId,
      id.data,
      body.data
    )

    return res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function deleteClient(
  req: Request,
  res: Response
) {
  const parsed = clientIdSchema.safeParse(req.params.id)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid client ID'
    })
  }

  try {
    await service.deleteClient(
      res.locals.userId,
      parsed.data
    )

    return res.json({
      success: true,
      message: 'Client deleted successfully'
    })
  } catch (error) {
    return handleError(res, error)
  }
}

export async function convertLead(
  req: Request,
  res: Response
) {
  const parsed = convertLeadSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lead ID'
    })
  }

  try {
    const client = await service.convertLeadToClient(
      res.locals.userId,
      parsed.data.leadId
    )

    return res.status(201).json({
      success: true,
      message: 'Lead converted to client successfully',
      data: client
    })
  } catch (error) {
    return handleError(res, error)
  }
}
