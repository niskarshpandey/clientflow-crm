import { apiRequest } from './client'

import type { ApiResponse } from '../types/auth'

import type {
  Project,
  ProjectInput,
  ProjectFilters,
  ProjectListResponse
} from '../types/project'

export const projectsApi = {
  list(
    token: string,
    filters: ProjectFilters = {}
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

    if (filters.clientId) {
      params.set('clientId', filters.clientId)
    }

    params.set('page', String(filters.page ?? 1))
    params.set('limit', String(filters.limit ?? 10))

    return apiRequest<ProjectListResponse>(
      `/projects?${params.toString()}`,
      {},
      token
    )
  },

  get(token: string, id: string) {
    return apiRequest<ApiResponse<Project>>(
      `/projects/${encodeURIComponent(id)}`,
      {},
      token
    )
  },

  create(token: string, data: ProjectInput) {
    return apiRequest<ApiResponse<Project>>(
      '/projects',
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
    data: Partial<ProjectInput>
  ) {
    return apiRequest<ApiResponse<Project>>(
      `/projects/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      token
    )
  },

  remove(token: string, id: string) {
    return apiRequest<{
      success: boolean
      message: string
    }>(
      `/projects/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      },
      token
    )
  }
}
