/**
 * DocuMind AI - Centralized API Client
 * Configured with HttpOnly cookie support and Authorization Bearer fallback.
 */

const rawBase = import.meta.env.VITE_API_BASE_URL || '/api/v1'
const trimmedBase = rawBase.replace(/\/+$/, '')
const API_BASE_URL = trimmedBase.endsWith('/api/v1') ? trimmedBase : `${trimmedBase}/api/v1`

export interface ApiResponse<T> {
  data: T
  status: number
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  status?: number
  details?: Record<string, unknown>
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    // Restore token from sessionStorage if present
    try {
      this.token = sessionStorage.getItem('documind_access_token')
    } catch {
      this.token = null
    }
  }

  public setToken(token: string | null) {
    this.token = token
    try {
      if (token) {
        sessionStorage.setItem('documind_access_token', token)
      } else {
        sessionStorage.removeItem('documind_access_token')
      }
    } catch {
      // In private browsing or storage-disabled environments
    }
  }

  public getToken(): string | null {
    return this.token
  }

  private getHeaders(customHeaders?: HeadersInit): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    })

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`)
    }

    return headers
  }

  public async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const res = await fetch(url, {
      ...options,
      method: 'GET',
      credentials: 'include',
      headers: this.getHeaders(options?.headers),
    })

    if (!res.ok) {
      throw await this.handleError(res)
    }

    const data = await res.json()
    return { data, status: res.status }
  }

  public async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const res = await fetch(url, {
      ...options,
      method: 'POST',
      credentials: 'include',
      headers: this.getHeaders(options?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      throw await this.handleError(res)
    }

    const data = await res.json()
    return { data, status: res.status }
  }

  public async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const res = await fetch(url, {
      ...options,
      method: 'PATCH',
      credentials: 'include',
      headers: this.getHeaders(options?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      throw await this.handleError(res)
    }

    const data = await res.json()
    return { data, status: res.status }
  }

  public async put<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const res = await fetch(url, {
      ...options,
      method: 'PUT',
      credentials: 'include',
      headers: this.getHeaders(options?.headers),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      throw await this.handleError(res)
    }

    const data = await res.json()
    return { data, status: res.status }
  }

  public async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    const res = await fetch(url, {
      ...options,
      method: 'DELETE',
      credentials: 'include',
      headers: this.getHeaders(options?.headers),
    })

    if (!res.ok) {
      throw await this.handleError(res)
    }

    const data = await res.json()
    return { data, status: res.status }
  }

  public async uploadFormData<T>(
    endpoint: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      xhr.withCredentials = true

      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`)
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded * 100) / event.total)
            onProgress(percentage)
          }
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText)
            resolve({ data: responseData, status: xhr.status })
          } catch {
            resolve({ data: {} as T, status: xhr.status })
          }
        } else {
          try {
            const errorJson = JSON.parse(xhr.responseText)
            reject({
              status: xhr.status,
              message: errorJson.detail || errorJson.message || `Upload failed with status ${xhr.status}`,
            })
          } catch {
            reject({
              status: xhr.status,
              message: `Upload failed with status ${xhr.status}`,
            })
          }
        }
      }

      xhr.onerror = () => {
        reject({
          status: 0,
          message: 'Network error occurred during document upload.',
        })
      }

      xhr.send(formData)
    })
  }

  private async handleError(res: Response): Promise<ApiError> {
    try {
      const err = await res.json()
      return {
        message: err.detail || err.message || `HTTP ${res.status}: ${res.statusText}`,
        code: err.code,
        status: res.status,
        details: err.details,
      }
    } catch {
      return {
        message: `HTTP ${res.status}: ${res.statusText}`,
        status: res.status,
      }
    }
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
