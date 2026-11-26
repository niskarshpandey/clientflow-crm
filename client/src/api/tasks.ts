import { apiRequest } from './client'

import type { ApiResponse } from '../types/auth'

import type {
  Task,
  TaskInput,
  TaskFilters,
  TaskListResponse,
  ProjectTaskSummary
} from '../types/task'

export const tasksApi = {
  list(
    token: string,
    filters: TaskFilters = {}
  ) {
    const params = new URLSearchParams()

    if (filters.search?.trim()) {
      params.set('search', filters.search.trim())
    }

    if (filters.status) {
      params.set('status', filters.status)
    }

    if (filters.priority) {
      params.set('priority', filters.priority)
    }

    if (filters.projectId) {
      params.set('projectId', filters.projectId)
    }

    params.set('page', String(filters.page ?? 1))

    params.set('limit', String(filters.limit ?? 10))

    return apiRequest<TaskListResponse>(
      `/tasks?${params.toString()}`,
      {},
      token
    )
  },

  get(
    token: string,
    id: string
  ) {
    return apiRequest<ApiResponse<Task>>(
      `/tasks/${encodeURIComponent(id)}`,
      {},
      token
    )
  },

  create(
    token: string,
    data: TaskInput
  ) {
    return apiRequest<ApiResponse<Task>>(
      '/tasks',
      {
        method: 'POST',
        body: JSON.stringify(data)
      },
      token
    )
  },

  update(
    token: string,
    id: string,
    data: Partial<TaskInput>
  ) {
    return apiRequest<ApiResponse<Task>>(
      `/tasks/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      token
    )
  },

  remove(
    token: string,
    id: string
  ) {
    return apiRequest<{
      success: boolean
      message: string
    }>(
      `/tasks/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      },
      token
    )
  },

  getProjectSummary(
    token: string,
    projectId: string
  ) {
    return apiRequest<ApiResponse<ProjectTaskSummary>>(
      `/tasks/project/${encodeURIComponent(projectId)}/summary`,
      {},
      token
    )
  }
}
