import { apiRequest } from './client'

import type { ApiResponse } from '../types/auth'

import type {
  DashboardOverview
} from '../types/dashboard'

export const dashboardApi = {
  getOverview(token: string) {
    return apiRequest<ApiResponse<DashboardOverview>>(
      '/dashboard/overview',
      {},
      token
    )
  }
}
