import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './AuthContext'
import { authApi } from '../api/auth'

import type {
  User,
  LoginCredentials,
  RegisterCredentials
} from '../types/auth'

const TOKEN_KEY = 'clientflow_token'

export function AuthProvider({
  children
}: {
  children: ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)

  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem(TOKEN_KEY)
  )

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function initializeAuth() {
      try {
        if (!token) {
          if (active) setUser(null)
          return
        }

        const response = await authApi.me(token)

        if (active) {
          setUser(response.data)
        }
      } catch {
        if (active) {
          sessionStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void initializeAuth()

    return () => {
      active = false
    }
  }, [token])

  async function login(credentials: LoginCredentials) {
    const response = await authApi.login(credentials)

    sessionStorage.setItem(
      TOKEN_KEY,
      response.data.token
    )

    setUser(response.data.user)
    setToken(response.data.token)
  }

  async function register(credentials: RegisterCredentials) {
    await authApi.register(credentials)
  }

  function updateUser(updatedUser: User) {
    setUser(current =>
      current && current.id === updatedUser.id
        ? { ...current, ...updatedUser }
        : current
    )
  }

  function logout() {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
