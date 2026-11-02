import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserProfile } from '../types'
import {
  authService,
  GenericResponse,
  LoginCredentials,
  SignupCredentials,
} from '../services/authService'

interface AuthContextType {
  user: UserProfile | null
  isAuthenticated: boolean
  isLoading: boolean
  backendError: string | null
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>
  signup: (credentials: SignupCredentials) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  verifyEmail: (token: string) => Promise<GenericResponse>
  resendVerification: (email: string) => Promise<GenericResponse>
  requestPasswordReset: (email: string) => Promise<GenericResponse>
  resetPassword: (token: string, newPass: string) => Promise<GenericResponse>
  changePassword: (curr: string, newPass: string) => Promise<GenericResponse>
  updateProfileName: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [backendError, setBackendError] = useState<string | null>(null)

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setBackendError(null)
    } catch (err: unknown) {
      setUser(null)
      const msg = (err as { message?: string })?.message || 'Unable to connect to authentication server.'
      setBackendError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const response = await authService.login(credentials)
      setUser(response.user)
      setBackendError(null)
      setIsLoading(false)
      return { success: true }
    } catch (err: unknown) {
      setIsLoading(false)
      const errorMsg = (err as { message?: string })?.message || 'Invalid email or password.'
      return { success: false, error: errorMsg }
    }
  }

  const signup = async (credentials: SignupCredentials) => {
    setIsLoading(true)
    try {
      const response = await authService.signup(credentials)
      setUser(response.user)
      setBackendError(null)
      setIsLoading(false)
      return { success: true }
    } catch (err: unknown) {
      setIsLoading(false)
      const errorMsg = (err as { message?: string })?.message || 'Failed to create account.'
      return { success: false, error: errorMsg }
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await authService.logout()
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }

  const verifyEmail = async (token: string) => {
    const res = await authService.verifyEmail(token)
    await refreshUser()
    return res
  }

  const resendVerification = async (email: string) => {
    return await authService.resendVerification(email)
  }

  const requestPasswordReset = async (email: string) => {
    return await authService.requestPasswordReset(email)
  }

  const resetPassword = async (token: string, newPass: string) => {
    return await authService.resetPassword(token, newPass)
  }

  const changePassword = async (curr: string, newPass: string) => {
    return await authService.changePassword(curr, newPass)
  }

  const updateProfileName = async (name: string) => {
    const updated = await authService.updateProfile(name)
    setUser(updated)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        backendError,
        login,
        signup,
        logout,
        refreshUser,
        verifyEmail,
        resendVerification,
        requestPasswordReset,
        resetPassword,
        changePassword,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
