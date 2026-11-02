import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DocumentItem, Collection, UploadProgressItem, ProcessingStatus, DocumentType } from '../types'
import { documentService, SAMPLE_DOCUMENTS } from '../services/documentService'
import { collectionService, SAMPLE_COLLECTIONS } from '../services/collectionService'

interface DocumentContextType {
  documents: DocumentItem[]
  collections: Collection[]
  selectedDocIds: string[]
  activeUploads: UploadProgressItem[]
  isLoading: boolean
  searchQuery: string
  statusFilter: ProcessingStatus | 'all'
  typeFilter: DocumentType | 'all'
  activeCollectionId: string | 'all'

  // Actions
  setSearchQuery: (query: string) => void
  setStatusFilter: (status: ProcessingStatus | 'all') => void
  setTypeFilter: (type: DocumentType | 'all') => void
  setActiveCollectionId: (id: string | 'all') => void
  toggleSelectDoc: (id: string) => void
  selectAllDocs: (ids: string[]) => void
  clearSelectedDocs: () => void
  deleteDoc: (id: string) => Promise<void>
  renameDoc: (id: string, newName: string) => Promise<void>
  reprocessDoc: (id: string) => Promise<void>
  createCollection: (name: string, description: string, color?: string) => Promise<Collection>
  deleteCollection: (id: string) => Promise<void>
  addUploads: (files: File[]) => void
  removeUpload: (id: string) => void
  clearCompletedUploads: () => void
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined)

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(SAMPLE_DOCUMENTS)
  const [collections, setCollections] = useState<Collection[]>(SAMPLE_COLLECTIONS)
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>(['sample-doc-1'])
  const [activeUploads, setActiveUploads] = useState<UploadProgressItem[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProcessingStatus | 'all'>('all')
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all')
  const [activeCollectionId, setActiveCollectionId] = useState<string | 'all'>('all')

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true)
    try {
      const docs = await documentService.listDocuments()
      setDocuments(docs)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCollections = useCallback(async () => {
    const cols = await collectionService.listCollections()
    setCollections(cols)
  }, [])

  useEffect(() => {
    fetchDocuments()
    fetchCollections()
  }, [fetchDocuments, fetchCollections])

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const selectAllDocs = (ids: string[]) => {
    setSelectedDocIds(ids)
  }

  const clearSelectedDocs = () => {
    setSelectedDocIds([])
  }

  const deleteDoc = async (id: string) => {
    await documentService.deleteDocument(id)
    setDocuments(prev => prev.filter(d => d.id !== id))
    setSelectedDocIds(prev => prev.filter(i => i !== id))
  }

  const renameDoc = async (id: string, newName: string) => {
    await documentService.renameDocument(id, newName)
    setDocuments(prev =>
      prev.map(d => (d.id === id ? { ...d, name: newName } : d))
    )
  }

  const createCollection = async (name: string, description: string, color?: string) => {
    const newCol = await collectionService.createCollection(name, description, color)
    setCollections(prev => [newCol, ...prev])
    return newCol
  }

  const deleteCollection = async (id: string) => {
    await collectionService.deleteCollection(id)
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  const addUploads = (files: File[]) => {
    const newUploadItems: UploadProgressItem[] = files.map(file => {
      const ext = (file.name.split('.').pop()?.toLowerCase() || 'pdf') as DocumentType
      return {
        id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        name: file.name,
        size: file.size,
        type: ext,
        progress: 0,
        status: 'pending',
      }
    })

    setActiveUploads(prev => [...prev, ...newUploadItems])

    // Real asynchronous backend upload and polling pipeline
    newUploadItems.forEach(item => {
      handleRealUpload(item)
    })
  }

  const handleRealUpload = async (item: UploadProgressItem) => {
    setActiveUploads(prev =>
      prev.map(u => (u.id === item.id ? { ...u, status: 'uploading', progress: 10 } : u))
    )

    try {
      const uploadRes = await documentService.uploadDocument(item.file, (percent) => {
        setActiveUploads(prev =>
          prev.map(u => (u.id === item.id ? { ...u, progress: Math.min(95, percent) } : u))
        )
      })

      const docId = uploadRes.document?.id || uploadRes.id || (uploadRes as any).id
      setActiveUploads(prev =>
        prev.map(u => (u.id === item.id ? { ...u, progress: 100, status: 'processing' } : u))
      )

      // Poll real processing status
      if (docId) {
        pollDocumentStatus(docId, item.id)
      } else {
        await fetchDocuments()
        setActiveUploads(prev =>
          prev.map(u => (u.id === item.id ? { ...u, status: 'success' } : u))
        )
      }
    } catch (err: any) {
      setActiveUploads(prev =>
        prev.map(u =>
          u.id === item.id
            ? { ...u, status: 'error', error: err?.message || 'Upload failed' }
            : u
        )
      )
    }
  }

  const pollDocumentStatus = (docId: string, uploadItemId: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await documentService.getDocument(docId)
        if (res) {
          if (res.status === 'ready') {
            clearInterval(interval)
            setActiveUploads(prev =>
              prev.map(u => (u.id === uploadItemId ? { ...u, status: 'success' } : u))
            )
            await fetchDocuments()
          } else if (res.status === 'failed') {
            clearInterval(interval)
            setActiveUploads(prev =>
              prev.map(u =>
                u.id === uploadItemId
                  ? { ...u, status: 'error', error: res.error || 'Processing failed' }
                  : u
              )
            )
            await fetchDocuments()
          }
        }
      } catch {
        // Continue polling
      }
    }, 1500)
  }

  const reprocessDoc = async (id: string) => {
    await documentService.reprocessDocument(id)
    setDocuments(prev =>
      prev.map(d => (d.id === id ? { ...d, status: 'indexing' } : d))
    )
    pollDocumentStatus(id, `reprocess-${id}`)
  }

  const removeUpload = (id: string) => {
    setActiveUploads(prev => prev.filter(u => u.id !== id))
  }

  const clearCompletedUploads = () => {
    setActiveUploads(prev => prev.filter(u => u.status !== 'success' && u.status !== 'error'))
  }

  return (
    <DocumentContext.Provider
      value={{
        documents,
        collections,
        selectedDocIds,
        activeUploads,
        isLoading,
        searchQuery,
        statusFilter,
        typeFilter,
        activeCollectionId,
        setSearchQuery,
        setStatusFilter,
        setTypeFilter,
        setActiveCollectionId,
        toggleSelectDoc,
        selectAllDocs,
        clearSelectedDocs,
        deleteDoc,
        renameDoc,
        reprocessDoc,
        createCollection,
        deleteCollection,
        addUploads,
        removeUpload,
        clearCompletedUploads,
      }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments() {
  const context = useContext(DocumentContext)
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider')
  }
  return context
}

