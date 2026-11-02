import { DocumentType } from '../types'

export const ALLOWED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md', 'csv', 'pptx']
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50MB

export interface FileValidationResult {
  valid: boolean
  error?: string
  detectedType?: DocumentType
}

export function validateDocumentFile(file: File): FileValidationResult {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported format ".${extension}". Supported formats: PDF, DOCX, TXT, MD, CSV, PPTX.`,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File appears to be empty (0 bytes).',
    }
  }

  return {
    valid: true,
    detectedType: extension as DocumentType,
  }
}

export interface PasswordStrength {
  score: number // 0 to 4
  label: string
  color: string
  hasMinLength: boolean
  hasUppercase: boolean
  hasNumber: boolean
  hasSpecial: boolean
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  let score = 0
  if (hasMinLength) score++
  if (hasUppercase) score++
  if (hasNumber) score++
  if (hasSpecial) score++

  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = [
    'bg-rose-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-indigo-500',
    'bg-emerald-500',
  ]

  return {
    score,
    label: labels[score] || 'Too weak',
    color: colors[score] || 'bg-rose-500',
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecial,
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

