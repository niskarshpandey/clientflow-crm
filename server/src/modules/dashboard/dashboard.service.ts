import { prisma } from '../../config/prisma'

import { Prisma } from '../../generated/prisma/client'

export async function getDashboardOverview(ownerId: string) {
  const now = new Date()

  const today = new Date(now)

  today.setUTCHours(0, 0, 0, 0)

  const upcomingUntil = new Date(today)

  upcomingUntil.setUTCDate(
    upcomingUntil.getUTCDate() + 8
  )

  const [
    totalLeads,
    wonLeads,
    lostLeads,
    totalClients,
    activeClients,
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
    openPipeline,
    wonPipeline,
    projectBudget,
    leadDistribution,
    clientDistribution,
    projectDistribution,
    taskDistribution,
    recentLeads,
    recentProjects,
    recentTasks,
    upcomingProjects,
    upcomingTasks
  ] = await prisma.$transaction([
    prisma.lead.count({
      where: { ownerId }
    }),

    prisma.lead.count({
      where: {
        ownerId,
        status: 'WON'
      }
    }),

    prisma.lead.count({
      where: {
        ownerId,
        status: 'LOST'
      }
    }),

    prisma.client.count({
      where: { ownerId }
    }),

    prisma.client.count({
      where: {
        ownerId,
        status: 'ACTIVE'
      }
    }),

    prisma.project.count({
      where: { ownerId }
    }),

    prisma.project.count({
      where: {
        ownerId,
        status: 'IN_PROGRESS'
      }
    }),

    prisma.task.count({
      where: { ownerId }
    }),

    prisma.task.count({
      where: {
        ownerId,
        status: 'COMPLETED'
      }
    }),

    prisma.task.count({
      where: {
        ownerId,
        dueDate: {
          lt: today
        },
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        }
      }
    }),

    prisma.lead.aggregate({
      where: {
        ownerId,
        status: {
          notIn: ['WON', 'LOST']
        }
      },
      _sum: {
        value: true
      }
    }),

    prisma.lead.aggregate({
      where: {
        ownerId,
        status: 'WON'
      },
      _sum: {
        value: true
      }
    }),

    prisma.project.aggregate({
      where: {
        ownerId,
        status: {
          not: 'CANCELLED'
        }
      },
      _sum: {
        budget: true
      }
    }),

    prisma.lead.groupBy({
      by: ['status'],
      where: { ownerId },
      _count: {
        _all: true
      }
    }),

    prisma.client.groupBy({
      by: ['status'],
      where: { ownerId },
      _count: {
        _all: true
      }
    }),

    prisma.project.groupBy({
      by: ['status'],
      where: { ownerId },
      _count: {
        _all: true
      }
    }),

    prisma.task.groupBy({
      by: ['status'],
      where: { ownerId },
      _count: {
        _all: true
      }
    }),

    prisma.lead.findMany({
      where: { ownerId },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 5,
      select: {
        id: true,
        name: true,
        company: true,
        status: true,
        priority: true,
        value: true,
        createdAt: true
      }
    }),

    prisma.project.findMany({
      where: { ownerId },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        priority: true,
        budget: true,
        dueDate: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),

    prisma.task.findMany({
      where: { ownerId },
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    }),

    prisma.project.findMany({
      where: {
        ownerId,
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        },
        dueDate: {
          gte: today,
          lt: upcomingUntil
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { id: 'asc' }
      ],
      take: 5,
      select: {
        id: true,
        name: true,
        status: true,
        priority: true,
        dueDate: true
      }
    }),

    prisma.task.findMany({
      where: {
        ownerId,
        status: {
          notIn: ['COMPLETED', 'CANCELLED']
        },
        dueDate: {
          gte: today,
          lt: upcomingUntil
        }
      },
      orderBy: [
        { dueDate: 'asc' },
        { id: 'asc' }
      ],
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        dueDate: true,
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
  ], {
    isolationLevel:
      Prisma.TransactionIsolationLevel.RepeatableRead
  })

  const cancelledTasks =
    taskDistribution.find(
      item => item.status === 'CANCELLED'
    )?._count._all ?? 0

  const activeTaskScope = totalTasks - cancelledTasks

  const leadConversionRate = totalLeads > 0
    ? Math.round((wonLeads / totalLeads) * 100)
    : 0

  const taskCompletionRate = activeTaskScope > 0
    ? Math.round(
        (completedTasks / activeTaskScope) * 100
      )
    : 0

  return {
    generatedAt: now.toISOString(),

    kpis: {
      totalLeads,
      wonLeads,
      lostLeads,
      totalClients,
      activeClients,
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      cancelledTasks,
      overdueTasks,
      leadConversionRate,
      taskCompletionRate,

      openPipelineValue:
        openPipeline._sum.value?.toString() ?? '0',

      wonLeadValue:
        wonPipeline._sum.value?.toString() ?? '0',

      totalProjectBudget:
        projectBudget._sum.budget?.toString() ?? '0'
    },

    distributions: {
      leads: leadDistribution.map(item => ({
        status: item.status,
        count: item._count._all
      })),

      clients: clientDistribution.map(item => ({
        status: item.status,
        count: item._count._all
      })),

      projects: projectDistribution.map(item => ({
        status: item.status,
        count: item._count._all
      })),

      tasks: taskDistribution.map(item => ({
        status: item.status,
        count: item._count._all
      }))
    },

    recent: {
      leads: recentLeads,
      projects: recentProjects,
      tasks: recentTasks
    },

    upcoming: {
      projects: upcomingProjects,
      tasks: upcomingTasks
    }
  }
}
