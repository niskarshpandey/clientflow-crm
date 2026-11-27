import { createContext } from 'react'

import type {
  User,
  LoginCredentials,
  RegisterCredentials
} from '../types/auth'

export interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
)
