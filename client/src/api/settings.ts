import { apiRequest } from './client'
import type { ApiResponse } from '../types/auth'

import type {
  PersonalProfile,
  BusinessProfile,
  BusinessProfileInput,
  ChangePasswordInput
} from '../types/settings'

export const settingsApi = {
  getProfile(token: string) {
    return apiRequest<ApiResponse<PersonalProfile>>(
      '/settings/profile',
      {},
      token
    )
  },

  updateProfile(token: string, name: string) {
    return apiRequest<ApiResponse<PersonalProfile>>(
      '/settings/profile',
      {
        method: 'PATCH',
        body: JSON.stringify({ name })
      },
      token
    )
  },

  getBusinessProfile(token: string) {
    return apiRequest<ApiResponse<BusinessProfile | null>>(
      '/settings/business',
      {},
      token
    )
  },

  updateBusinessProfile(
    token: string,
    data: BusinessProfileInput
  ) {
    return apiRequest<ApiResponse<BusinessProfile>>(
      '/settings/business',
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      token
    )
  },

  changePassword(
    token: string,
    data: ChangePasswordInput
  ) {
    return apiRequest<{
      success: boolean
      message: string
    }>(
      '/settings/password',
      {
        method: 'PATCH',
        body: JSON.stringify(data)
      },
      token
    )
  }
}