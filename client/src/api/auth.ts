import { apiRequest } from './client'

import type {
  ApiResponse,
  User,
  LoginCredentials,
  RegisterCredentials,
  LoginResponse
} from '../types/auth'

export const authApi = {
  register(credentials: RegisterCredentials) {
    return apiRequest<ApiResponse<User>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  },

  login(credentials: LoginCredentials) {
    return apiRequest<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })
  },

  me(token: string) {
    return apiRequest<ApiResponse<User>>(
      '/auth/me',
      { method: 'GET' },
      token
    )
  }
}
