'use client'
import { useAuth0 } from '@auth0/auth0-react'
import { LogoutOptions, RedirectLoginOptions } from '@auth0/auth0-react/dist/auth0-context'
import { User } from '@auth0/auth0-spa-js'

export interface AuthState {
  isLoading: boolean
  isAuthenticated: boolean
  user?: User
  loginWithRedirect: (options?: RedirectLoginOptions) => Promise<void>
  logout: (options?: LogoutOptions) => Promise<void>
}

export function useAuth(): AuthState {
  const { isLoading, isAuthenticated, user, loginWithRedirect, logout } = useAuth0()

  return { isLoading, isAuthenticated, user, loginWithRedirect, logout }
}

export function useAuthUser(): User {
  const { user } = useAuth0()

  return user!
}
