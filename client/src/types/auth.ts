export interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}
