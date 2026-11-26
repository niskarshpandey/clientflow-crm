import { prisma } from '../../config/prisma'
import type { Prisma } from '../../generated/prisma/client'

import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectQueryInput
} from './project.validation'

export class ProjectError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
  }
}

const projectInclude = {
  client: {
    select: {
      id: true,
      name: true,
      company: true,
      status: true
    }
  }
} satisfies Prisma.ProjectInclude

function handleDatabaseError(error: unknown): never {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  ) {
    if (error.code === 'P2025') {
      throw new ProjectError(404, 'Project not found')
    }

    if (error.code === 'P2003') {
      throw new ProjectError(
        409,
        'Related record is unavailable or still in use'
      )
    }

    if (error.code === 'P2034') {
      throw new ProjectError(
        409,
        'Concurrent update detected. Please retry.'
      )
    }
  }

  throw error
}

async function verifyClient(
  tx: Prisma.TransactionClient,
  ownerId: string,
  clientId: string
) {
  const client = await tx.client.findFirst({
    where: {
      id: clientId,
      ownerId
    },
    select: {
      id: true
    }
  })

  if (!client) {
    throw new ProjectError(404, 'Client not found')
  }
}

function validateDates(
  startDate: Date | null,
  dueDate: Date | null
) {
  if (
    startDate &&
    dueDate &&
    dueDate.getTime() < startDate.getTime()
  ) {
    throw new ProjectError(
      400,
      'Due date cannot be earlier than start date'
    )
  }
}

export async function createProject(
  ownerId: string,
  data: CreateProjectInput
) {
  try {
    return await prisma.$transaction(async tx => {
      await verifyClient(tx, ownerId, data.clientId)

      const startDate = data.startDate
        ? new Date(data.startDate)
        : null

      const dueDate = data.dueDate
        ? new Date(data.dueDate)
        : null

      validateDates(startDate, dueDate)

      return tx.project.create({
        data: {
          ...data,
          ownerId,
          startDate,
          dueDate,
          completedAt: data.status === 'COMPLETED'
            ? new Date()
            : null
        },
        include: projectInclude
      })
    }, {
      isolationLevel: 'Serializable'
    })
  } catch (error) {
    handleDatabaseError(error)
  }
}

export async function getProjects(
  ownerId: string,
  query: ProjectQueryInput
) {
  const {
    search,
    status,
    priority,
    clientId,
    page,
    limit
  } = query

  const where: Prisma.ProjectWhereInput = {
    ownerId
  }

  if (status) where.status = status
  if (priority) where.priority = priority
  if (clientId) where.clientId = clientId

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        description: {
          contains: search,
          mode: 'insensitive'
        }
      },
      {
        client: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      },
      {
        client: {
          company: {
            contains: search,
            mode: 'insensitive'
          }
        }
      }
    ]
  }

  const [projects, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      include: projectInclude
    }),

    prisma.project.count({ where })
  ])

  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getProjectById(
  ownerId: string,
  id: string
) {
  const project = await prisma.project.findFirst({
    where: {
      id,
      ownerId
    },
    include: projectInclude
  })

  if (!project) {
    throw new ProjectError(404, 'Project not found')
  }

  return project
}

export async function updateProject(
  ownerId: string,
  id: string,
  data: UpdateProjectInput
) {
  try {
    return await prisma.$transaction(async tx => {
      const existing = await tx.project.findFirst({
        where: {
          id,
          ownerId
        }
      })

      if (!existing) {
        throw new ProjectError(404, 'Project not found')
      }

      if (data.clientId !== undefined) {
        await verifyClient(tx, ownerId, data.clientId)
      }

      const startDate = data.startDate === undefined
        ? existing.startDate
        : data.startDate
          ? new Date(data.startDate)
          : null

      const dueDate = data.dueDate === undefined
        ? existing.dueDate
        : data.dueDate
          ? new Date(data.dueDate)
          : null

      validateDates(startDate, dueDate)

      const nextStatus = data.status ?? existing.status

      const completedAt = nextStatus === 'COMPLETED'
        ? existing.completedAt ?? new Date()
        : null

      return tx.project.update({
        where: {
          id,
          ownerId
        },
        data: {
          ...data,
          startDate,
          dueDate,
          completedAt
        },
        include: projectInclude
      })
    }, {
      isolationLevel: 'Serializable'
    })
  } catch (error) {
    handleDatabaseError(error)
  }
}

export async function deleteProject(
  ownerId: string,
  id: string
) {
  try {
    const result = await prisma.project.deleteMany({
      where: {
        id,
        ownerId
      }
    })

    if (result.count === 0) {
      throw new ProjectError(404, 'Project not found')
    }
  } catch (error) {
    handleDatabaseError(error)
  }
}
