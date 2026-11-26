import type {
  ProjectStatus,
  ProjectPriority
} from './project'

import type {
  TaskStatus,
  TaskPriority
} from './task'

export type DashboardLeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST'

export type DashboardClientStatus =
  | 'PROSPECT'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'ARCHIVED'

export interface DashboardKpis {
  totalLeads: number
  wonLeads: number
  lostLeads: number
  totalClients: number
  activeClients: number
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  cancelledTasks: number
  overdueTasks: number
  leadConversionRate: number
  taskCompletionRate: number
  openPipelineValue: string
  wonLeadValue: string
  totalProjectBudget: string
}

export interface StatusCount<T extends string> {
  status: T
  count: number
}

export interface DashboardLead {
  id: string
  name: string
  company: string | null
  status: DashboardLeadStatus
  priority: ProjectPriority
  value: string
  createdAt: string
}

export interface DashboardProject {
  id: string
  name: string
  status: ProjectStatus
  priority: ProjectPriority
  budget: string
  dueDate: string | null
  createdAt: string
  client: {
    id: string
    name: string
  }
}

export interface DashboardTask {
  id: string
  title: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  createdAt: string
  project: {
    id: string
    name: string
  }
}

export type UpcomingProject = Pick<
  DashboardProject,
  'id' | 'name' | 'status' | 'priority' | 'dueDate'
>

export type UpcomingTask = Pick<
  DashboardTask,
  'id' | 'title' | 'status' | 'priority' | 'dueDate' | 'project'
>

export interface DashboardOverview {
  generatedAt: string

  kpis: DashboardKpis

  distributions: {
    leads: StatusCount<DashboardLeadStatus>[]
    clients: StatusCount<DashboardClientStatus>[]
    projects: StatusCount<ProjectStatus>[]
    tasks: StatusCount<TaskStatus>[]
  }

  recent: {
    leads: DashboardLead[]
    projects: DashboardProject[]
    tasks: DashboardTask[]
  }

  upcoming: {
    projects: UpcomingProject[]
    tasks: UpcomingTask[]
  }
}
