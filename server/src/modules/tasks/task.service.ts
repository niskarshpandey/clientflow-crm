import { prisma } from '../../config/prisma'
import { Prisma } from '../../generated/prisma/client'

import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskQuery
} from './task.validation'

export class TaskError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'TaskError'
  }
}

const taskInclude = {
  project: {
    select: {
      id: true,
      name: true,
      status: true,
      client: {
        select: {
          id: true,
          name: true,
          company: true
        }
      }
    }
  }
} satisfies Prisma.TaskInclude

function handleDatabaseError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw new TaskError(404, 'Task not found')
    }

    if (error.code === 'P2003') {
      throw new TaskError(409, 'Related record is unavailable or still in use')
    }

    if (error.code === 'P2034') {
      throw new TaskError(409, 'Concurrent update detected. Please try again')
    }
  }

  throw error
}

async function verifyProject(
  tx: Prisma.TransactionClient,
  ownerId: string,
  projectId: string
) {
  const project = await tx.project.findFirst({
    where: {
      id: projectId,
      ownerId
    },
    select: {
      id: true
    }
  })

  if (!project) {
    throw new TaskError(404, 'Project not found')
  }

  return project
}

function validateDates(
  startDate: Date | null,
  dueDate: Date | null
) {
  if (startDate && dueDate && dueDate < startDate) {
    throw new TaskError(
      400,
      'Due date cannot be earlier than start date'
    )
  }
}

export async function createTask(
  ownerId: string,
  data: CreateTaskInput
) {
  try {
    return await prisma.$transaction(async tx => {
      await verifyProject(tx, ownerId, data.projectId)

      const startDate = data.startDate
        ? new Date(data.startDate)
        : null

      const dueDate = data.dueDate
        ? new Date(data.dueDate)
        : null

      validateDates(startDate, dueDate)

      return tx.task.create({
        data: {
          ...data,
          ownerId,
          startDate,
          dueDate,
          completedAt: data.status === 'COMPLETED'
            ? new Date()
            : null
        },
        include: taskInclude
      })
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    })
  } catch (error) {
    handleDatabaseError(error)
  }
}

export async function getTasks(
  ownerId: string,
  query: TaskQuery
) {
  const {
    search,
    status,
    priority,
    projectId,
    page,
    limit
  } = query

  const where: Prisma.TaskWhereInput = {
    ownerId
  }

  if (status) where.status = status

  if (priority) where.priority = priority

  if (projectId) where.projectId = projectId

  if (search) {
    where.OR = [
      {
        title: {
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
        project: {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        }
      }
    ]
  }

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      include: taskInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ]
    }),
    prisma.task.count({ where })
  ], {
    isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead
  })

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}

export async function getTaskById(
  ownerId: string,
  id: string
) {
  const task = await prisma.task.findFirst({
    where: {
      id,
      ownerId
    },
    include: taskInclude
  })

  if (!task) {
    throw new TaskError(404, 'Task not found')
  }

  return task
}

export async function updateTask(
  ownerId: string,
  id: string,
  data: UpdateTaskInput
) {
  try {
    return await prisma.$transaction(async tx => {
      const existing = await tx.task.findFirst({
        where: {
          id,
          ownerId
        }
      })

      if (!existing) {
        throw new TaskError(404, 'Task not found')
      }

      if (data.projectId !== undefined) {
        await verifyProject(tx, ownerId, data.projectId)
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

      return tx.task.update({
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
        include: taskInclude
      })
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    })
  } catch (error) {
    handleDatabaseError(error)
  }
}

export async function deleteTask(
  ownerId: string,
  id: string
) {
  try {
    const result = await prisma.task.deleteMany({
      where: {
        id,
        ownerId
      }
    })

    if (result.count === 0) {
      throw new TaskError(404, 'Task not found')
    }
  } catch (error) {
    handleDatabaseError(error)
  }
}

export async function getProjectTaskSummary(
  ownerId: string,
  projectId: string
) {
  return prisma.$transaction(async tx => {
    await verifyProject(tx, ownerId, projectId)

    const groups = await tx.task.groupBy({
      by: ['status'],
      where: {
        ownerId,
        projectId
      },
      _count: {
        _all: true
      }
    })

    const counts = {
      TO_DO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      COMPLETED: 0,
      CANCELLED: 0
    }

    for (const group of groups) {
      counts[group.status] = group._count._all
    }

    const total = Object.values(counts)
      .reduce((sum, count) => sum + count, 0)

    const activeScope = total - counts.CANCELLED

    const progress = activeScope === 0
      ? 0
      : Math.round(
          (counts.COMPLETED / activeScope) * 100
        )

    return {
      projectId,
      total,
      todo: counts.TO_DO,
      inProgress: counts.IN_PROGRESS,
      inReview: counts.IN_REVIEW,
      completed: counts.COMPLETED,
      cancelled: counts.CANCELLED,
      progress
    }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead
  })
}
