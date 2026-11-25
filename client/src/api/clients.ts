import { apiRequest } from './client'

import type { ApiResponse } from '../types/auth'

import type {
  Client,
  ClientInput,
  ClientFilters,
  ClientListResponse
} from '../types/client'

export const clientsApi = {
  list(token: string, filters: ClientFilters = {}) {
    const params = new URLSearchParams()

    if (filters.search?.trim()) {
      params.set('search', filters.search.trim())
    }

    if (filters.status) {
      params.set('status', filters.status)
    }

    params.set('page', String(filters.page ?? 1))
    params.set('limit', String(filters.limit ?? 10))

    return apiRequest<ClientListResponse>(
      `/clients?${params.toString()}`,
      {},
      token
    )
  },

  get(token: string, id: string) {
    return apiRequest<ApiResponse<Client>>(
      `/clients/${encodeURIComponent(id)}`,
      {},
      token
    )
  },

  create(token: string, data: ClientInput) {
    return apiRequest<ApiResponse<Client>>(
      '/clients',
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
    data: Partial<ClientInput>
  ) {
    return apiRequest<ApiResponse<Client>>(
      `/clients/${encodeURIComponent(id)}`,
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
      `/clients/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      },
      token
    )
  },

  convertLead(token: string, leadId: string) {
    return apiRequest<ApiResponse<Client>>(
      '/clients/convert-lead',
      {
        method: 'POST',
        body: JSON.stringify({ leadId })
      },
      token
    )
  }
}
