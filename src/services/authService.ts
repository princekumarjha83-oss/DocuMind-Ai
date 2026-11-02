import { apiClient } from './apiClient'
import { UserProfile } from '../types'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: UserProfile
  requires_email_verification?: boolean
  message?: string
}

export interface GenericResponse {
  success: boolean
  message: string
}

export interface UserPreferences {
  theme: string
  language: string
  email_notifications: boolean
  zero_retention_acknowledged: boolean
}

export const authService = {
  /**
   * Send login credentials to backend
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/login', {
      email: credentials.email,
      password: credentials.password,
      remember_me: credentials.rememberMe ?? false,
    })
    apiClient.setToken(res.data.access_token)
    return res.data
  },

  /**
   * Register new user account
   */
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<AuthResponse>('/auth/register', {
      name: credentials.name,
      email: credentials.email,
      password: credentials.password,
      terms_accepted: true,
    })
    apiClient.setToken(res.data.access_token)
    return res.data
  },

  /**
   * Request password reset link
   */
  async requestPasswordReset(email: string): Promise<GenericResponse> {
    const res = await apiClient.post<GenericResponse>('/auth/forgot-password', { email })
    return res.data
  },

  /**
   * Reset password using token
   */
  async resetPassword(token: string, newPassword: string): Promise<GenericResponse> {
    const res = await apiClient.post<GenericResponse>('/auth/reset-password', {
      token,
      new_password: newPassword,
      confirm_password: newPassword,
    })
    return res.data
  },

  /**
   * Verify email address using token
   */
  async verifyEmail(token: string): Promise<GenericResponse> {
    const res = await apiClient.post<GenericResponse>('/auth/verify-email', { token })
    return res.data
  },

  /**
   * Resend email verification link
   */
  async resendVerification(email: string): Promise<GenericResponse> {
    const res = await apiClient.post<GenericResponse>('/auth/resend-verification', { email })
    return res.data
  },

  /**
   * Change password with current password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<GenericResponse> {
    const res = await apiClient.post<GenericResponse>('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword,
    })
    return res.data
  },

  /**
   * Get authenticated user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const res = await apiClient.get<UserProfile>('/auth/me')
      return res.data
    } catch {
      return null
    }
  },

  /**
   * Update full name
   */
  async updateProfile(name: string): Promise<UserProfile> {
    const res = await apiClient.patch<UserProfile>('/users/me', { name })
    return res.data
  },

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<UserPreferences> {
    const res = await apiClient.get<UserPreferences>('/users/me/preferences')
    return res.data
  },

  /**
   * Update user preferences
   */
  async updatePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const res = await apiClient.patch<UserPreferences>('/users/me/preferences', prefs)
    return res.data
  },

  /**
   * End session
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // Ignore network errors on logout
    } finally {
      apiClient.setToken(null)
    }
  },

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    try {
      await apiClient.post('/auth/logout-all')
    } catch {
      // Ignore network errors
    } finally {
      apiClient.setToken(null)
    }
  },

  /**
   * Delete account permanently
   */
  async deleteAccount(): Promise<GenericResponse> {
    const res = await apiClient.delete<GenericResponse>('/users/me')
    apiClient.setToken(null)
    return res.data
  },
}
