export type ProjectStatus =
  | 'PLANNING'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED'

export type ProjectPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT'

export interface ProjectClient {
  id: string
  name: string
  company: string | null
  status: 'PROSPECT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED'
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  priority: ProjectPriority
  budget: string
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  ownerId: string
  clientId: string
  client: ProjectClient
  createdAt: string
  updatedAt: string
}

export interface ProjectInput {
  name: string
  description?: string | null
  clientId: string
  status?: ProjectStatus
  priority?: ProjectPriority
  budget?: number
  startDate?: string | null
  dueDate?: string | null
}

export interface ProjectFilters {
  search?: string
  status?: ProjectStatus
  priority?: ProjectPriority
  clientId?: string
  page?: number
  limit?: number
}

export interface ProjectPagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ProjectListResponse {
  success: boolean
  data: Project[]
  pagination: ProjectPagination
}

export const PROJECT_STATUSES: ProjectStatus[] = [
  'PLANNING',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED'
]

export const PROJECT_PRIORITIES: ProjectPriority[] = [
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
]
