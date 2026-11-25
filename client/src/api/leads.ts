import { apiRequest } from './client'

import type { ApiResponse } from '../types/auth'

import type {
  Lead,
  LeadInput,
  LeadFilters,
  LeadListResponse
} from '../types/lead'

export const leadsApi = {
  list(token: string, filters: LeadFilters = {}) {
    const params = new URLSearchParams()

    if (filters.search) {
      params.set('search', filters.search)
    }

    if (filters.status) {
      params.set('status', filters.status)
    }

    if (filters.priority) {
      params.set('priority', filters.priority)
    }

    params.set('page', String(filters.page ?? 1))
    params.set('limit', String(filters.limit ?? 10))

    return apiRequest<LeadListResponse>(
      `/leads?${params.toString()}`,
      {},
      token
    )
  },

  get(token: string, id: string) {
    return apiRequest<ApiResponse<Lead>>(
      `/leads/${encodeURIComponent(id)}`,
      {},
      token
    )
  },

  create(token: string, data: LeadInput) {
    return apiRequest<ApiResponse<Lead>>(
      '/leads',
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
    data: Partial<LeadInput>
  ) {
    return apiRequest<ApiResponse<Lead>>(
      `/leads/${encodeURIComponent(id)}`,
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
      `/leads/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      },
      token
    )
  }
}
