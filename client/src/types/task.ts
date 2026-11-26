export type TaskStatus =
  | 'TO_DO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'

export type TaskPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT'

export interface TaskProject {
  id: string
  name: string
  status:
    | 'PLANNING'
    | 'IN_PROGRESS'
    | 'ON_HOLD'
    | 'COMPLETED'
    | 'CANCELLED'
  client: {
    id: string
    name: string
    company: string | null
  }
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  estimatedHours: string | null
  actualHours: string | null
  ownerId: string
  projectId: string
  project: TaskProject
  createdAt: string
  updatedAt: string
}

export interface TaskInput {
  title: string
  description?: string | null
  projectId: string
  status?: TaskStatus
  priority?: TaskPriority
  startDate?: string | null
  dueDate?: string | null
  estimatedHours?: number | null
  actualHours?: number | null
}

export interface TaskFilters {
  search?: string
  status?: TaskStatus
  priority?: TaskPriority
  projectId?: string
  page?: number
  limit?: number
}

export interface TaskPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TaskListResponse {
  success: boolean
  data: Task[]
  pagination: TaskPagination
}

export interface ProjectTaskSummary {
  projectId: string
  total: number
  todo: number
  inProgress: number
  inReview: number
  completed: number
  cancelled: number
  progress: number
}

export const TASK_STATUSES: TaskStatus[] = [
  'TO_DO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'COMPLETED',
  'CANCELLED'
]

export const TASK_PRIORITIES: TaskPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
]

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TO_DO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
}

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
}
