import { prisma } from '../../config/prisma'

import type { Prisma } from '../../generated/prisma/client'

import type {
  CreateClientInput,
  UpdateClientInput,
  ClientQueryInput
} from './client.validation'

import { createClientSchema } from './client.validation'

export class ClientError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
  }
}

export async function createClient(
  ownerId: string,
  data: CreateClientInput
) {
  return prisma.client.create({
    data: {
      ...data,
      ownerId
    }
  })
}

export async function getClients(
  ownerId: string,
  query: ClientQueryInput
) {
  const { search, status, page, limit } = query

  const where: Prisma.ClientWhereInput = {
    ownerId
  }

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
      { industry: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [clients, total] = await prisma.$transaction([
    prisma.client.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ]
    }),

    prisma.client.count({ where })
  ])

  return {
    clients,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getClientById(
  ownerId: string,
  id: string
) {
  const client = await prisma.client.findFirst({
    where: { id, ownerId }
  })

  if (!client) {
    throw new ClientError(404, 'Client not found')
  }

  return client
}

export async function updateClient(
  ownerId: string,
  id: string,
  data: UpdateClientInput
) {
  try {
    return await prisma.client.update({
      where: { id, ownerId },
      data
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      throw new ClientError(404, 'Client not found')
    }

    throw error
  }
}

export async function deleteClient(
  ownerId: string,
  id: string
) {
  try {
    const result = await prisma.client.deleteMany({
      where: {
        id,
        ownerId
      }
    })

    if (result.count === 0) {
      throw new ClientError(404, 'Client not found')
    }
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2003'
    ) {
      throw new ClientError(
        409,
        'Cannot delete client with linked projects'
      )
    }

    throw error
  }
}

export async function convertLeadToClient(
  ownerId: string,
  leadId: string
) {
  try {
    return await prisma.$transaction(async tx => {
      const lead = await tx.lead.findFirst({
        where: {
          id: leadId,
          ownerId
        }
      })

      if (!lead) {
        throw new ClientError(404, 'Lead not found')
      }

      if (lead.status !== 'WON') {
        throw new ClientError(
          400,
          'Only WON leads can be converted to clients'
        )
      }

      const existingClient = await tx.client.findUnique({
        where: { leadId }
      })

      if (existingClient) {
        throw new ClientError(
          409,
          'Lead has already been converted'
        )
      }

      const validated = createClientSchema.safeParse({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        notes: lead.notes,
        status: 'ACTIVE'
      })

      if (!validated.success) {
        throw new ClientError(
          400,
          'Correct invalid lead details before conversion'
        )
      }

      return tx.client.create({
        data: {
          ...validated.data,
          ownerId,
          leadId
        }
      })
    }, {
      isolationLevel: 'Serializable'
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error
    ) {
      if (error.code === 'P2002') {
        throw new ClientError(
          409,
          'Lead has already been converted'
        )
      }

      if (error.code === 'P2034') {
        throw new ClientError(
          409,
          'Concurrent update detected. Please retry.'
        )
      }
    }

    throw error
  }
}
