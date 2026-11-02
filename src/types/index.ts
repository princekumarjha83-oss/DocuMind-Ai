export type ProcessingStatus = 'queued' | 'uploading' | 'extracting' | 'indexing' | 'ready' | 'failed'

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'md' | 'csv' | 'pptx'

export interface DocumentItem {
  id: string
  name: string
  size: number
  type: DocumentType
  status: ProcessingStatus
  uploadedAt: string
  pageCount?: number
  collectionId?: string
  collectionName?: string
  extractedText?: string
  chunksCount?: number
  summary?: string
  error?: string
  isSample?: boolean
  fileUrl?: string
}

export interface Citation {
  id: string
  documentId: string
  documentName: string
  pageNumber?: number
  excerpt: string
  relevanceScore: number
  sectionHeading?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  citations?: Citation[]
  isStreaming?: boolean
  status?: 'sending' | 'complete' | 'error'
  isSamplePreview?: boolean
}

export interface Conversation {
  id: string
  title: string
  documentIds: string[]
  documentNames?: string[]
  createdAt: string
  updatedAt: string
  lastMessageSnippet?: string
  messageCount: number
}

export interface Collection {
  id: string
  name: string
  description: string
  color: string
  documentIds: string[]
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  plan: 'free' | 'pro' | 'team'
  role: 'member' | 'admin'
  is_email_verified?: boolean
  is_active?: boolean
  createdAt: string
}

export interface UploadProgressItem {
  id: string
  file: File
  name: string
  size: number
  type: DocumentType
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error'
  error?: string
}

export type ThemeMode = 'dark' | 'light' | 'system'

