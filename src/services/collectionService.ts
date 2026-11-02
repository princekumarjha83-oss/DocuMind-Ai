import { apiClient } from './apiClient'
import { Collection } from '../types'

export const SAMPLE_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: 'Financials & Quarterly',
    description: 'Financial reports, balance sheets, investor updates, and audit filings.',
    color: '#6366F1',
    documentIds: ['sample-doc-1', 'sample-doc-4'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'col-2',
    name: 'Engineering & Compliance',
    description: 'Security architectures, API specs, SOC2 policies, and AI research benchmarks.',
    color: '#06B6D4',
    documentIds: ['sample-doc-2', 'sample-doc-3'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'col-3',
    name: 'Legal & Vendor Contracts',
    description: 'Customer Master Service Agreements, NDAs, and Service Level Agreements.',
    color: '#8B5CF6',
    documentIds: [],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
  },
]

export const collectionService = {
  async listCollections(): Promise<Collection[]> {
    try {
      const res = await apiClient.get<Collection[]>('/collections')
      return res.data
    } catch {
      return SAMPLE_COLLECTIONS
    }
  },

  async createCollection(name: string, description: string, color?: string): Promise<Collection> {
    try {
      const res = await apiClient.post<Collection>('/collections', { name, description, color })
      return res.data
    } catch {
      const newCol: Collection = {
        id: `col-${Date.now()}`,
        name,
        description,
        color: color || '#6366F1',
        documentIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      return newCol
    }
  },

  async deleteCollection(id: string): Promise<void> {
    try {
      await apiClient.delete(`/collections/${id}`)
    } catch {
      // Handled in state
    }
  },
}

