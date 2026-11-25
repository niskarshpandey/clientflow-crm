import { prisma } from '../../config/prisma'
import type { Prisma } from '../../generated/prisma/client'

import type {
  CreateLeadInput,
  UpdateLeadInput,
  LeadQueryInput
} from './lead.validation'

export class LeadError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
  }
}

export async function createLead(
  ownerId: string,
  data: CreateLeadInput
) {
  return prisma.lead.create({
    data: {
      ...data,
      ownerId
    }
  })
}

export async function getLeads(
  ownerId: string,
  query: LeadQueryInput
) {
  const { search, status, priority, page, limit } = query

  const where: Prisma.LeadWhereInput = {
    ownerId
  }

  if (status) {
    where.status = status
  }

  if (priority) {
    where.priority = priority
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } }
    ]
  }

  const [leads, total] = await prisma.$transaction([
    prisma.lead.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ]
    }),

    prisma.lead.count({ where })
  ])

  return {
    leads,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getLeadById(
  ownerId: string,
  id: string
) {
  const lead = await prisma.lead.findFirst({
    where: {
      id,
      ownerId
    }
  })

  if (!lead) {
    throw new LeadError(404, 'Lead not found')
  }

  return lead
}

export async function updateLead(
  ownerId: string,
  id: string,
  data: UpdateLeadInput
) {
  try {
    return await prisma.lead.update({
      where: {
        id,
        ownerId
      },
      data
    })
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      throw new LeadError(404, 'Lead not found')
    }

    throw error
  }
}

export async function deleteLead(
  ownerId: string,
  id: string
) {
  const result = await prisma.lead.deleteMany({
    where: {
      id,
      ownerId
    }
  })

  if (result.count === 0) {
    throw new LeadError(404, 'Lead not found')
  }
}
