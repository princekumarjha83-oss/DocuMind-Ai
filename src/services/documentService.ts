import { apiClient, ApiResponse } from './apiClient'
import { DocumentItem, DocumentType, ProcessingStatus } from '../types'

export interface UploadDocumentResponse {
  id?: string
  document?: DocumentItem
  name?: string
  size?: number
  type?: string
  status?: string
  message: string
}

export interface DocumentQueryParams {
  search?: string
  type?: DocumentType | 'all'
  status?: ProcessingStatus | 'all'
  collectionId?: string
  sortBy?: 'name' | 'date' | 'size'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Sample demonstration documents clearly labeled as sample data
export const SAMPLE_DOCUMENTS: DocumentItem[] = [
  {
    id: 'sample-doc-1',
    name: 'Q3_Financial_Analysis_Report.pdf',
    size: 2450000,
    type: 'pdf',
    status: 'ready',
    uploadedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    pageCount: 24,
    collectionId: 'col-1',
    collectionName: 'Financials & Quarterly',
    summary: 'Executive overview of Q3 revenue growth (+28% YoY), gross margin expansion to 74.2%, and cash runway projection through 2027.',
    chunksCount: 142,
    isSample: true,
    extractedText: `EXECUTIVE SUMMARY - Q3 FINANCIAL PERFORMANCE\n\nTotal revenue for Q3 achieved $48.6M, representing a 28% year-over-year increase driven by strong enterprise subscription adoption and enterprise retention rate of 118%.\n\nGross profit margin reached 74.2%, up 320 bps from Q2, reflecting platform infrastructure optimizations and multi-tenant scaling efficiencies.\n\nOperating expenses totaled $32.1M, reflecting targeted investments in AI research and semantic search infrastructure.\n\nCash and cash equivalents at the end of the quarter stood at $94.2M, providing runway through Q4 2027 under current growth assumptions.`
  },
  {
    id: 'sample-doc-2',
    name: 'Enterprise_Architecture_Security_Spec.docx',
    size: 1180000,
    type: 'docx',
    status: 'ready',
    uploadedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    pageCount: 16,
    collectionId: 'col-2',
    collectionName: 'Engineering & Compliance',
    summary: 'SOC 2 Type II controls, zero-trust network boundaries, AES-256 encryption at rest, and tenant vector-namespace isolation.',
    chunksCount: 88,
    isSample: true,
    extractedText: `ENTERPRISE SECURITY & DATA PRIVACY SPECIFICATION\n\n1. Cryptographic Controls: All tenant document chunks and vector embeddings are encrypted at rest using AES-GCM-256 with tenant-specific envelope keys managed via AWS KMS.\n\n2. In-Transit Encryption: All ingress and egress traffic is enforced via TLS 1.3 with strict HSTS preloading.\n\n3. Retrieval Isolation: Vector retrieval strictly partitions index queries by tenant_id and document access control lists (ACL) prior to approximate nearest neighbor search.\n\n4. Zero-Persistence LLM Policy: Customer document embeddings and prompts are processed under zero-data-retention agreements; no customer documents are ever used for foundation model training.`
  },
  {
    id: 'sample-doc-3',
    name: 'RAG_Pipeline_Benchmark_Evaluation.pdf',
    size: 3200000,
    type: 'pdf',
    status: 'ready',
    uploadedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    pageCount: 32,
    collectionId: 'col-2',
    collectionName: 'Engineering & Compliance',
    summary: 'Empirical benchmark comparison between naive chunking vs. hierarchical semantic chunking with hybrid BM25 + dense retrieval.',
    chunksCount: 194,
    isSample: true,
    extractedText: `HYBRID RETRIEVAL BENCHMARKS ON UNSTRUCTURED LEGAL AND FINANCIAL CORPUS\n\nAbstract: We evaluate reciprocal rank fusion (RRF) combining sparse BM25 token matching with 1536-dimensional dense bi-encoder embeddings.\n\nResults demonstrate a 24.3% increase in Mean Reciprocal Rank (MRR@10) and a 31% reduction in hallucination rates compared to dense-only retrieval.\n\nContext reranking via cross-encoder models further improves precision-at-k for complex multi-hop queries across multi-page tables.`
  },
  {
    id: 'sample-doc-4',
    name: 'Customer_Success_Quarterly_Survey.csv',
    size: 450000,
    type: 'csv',
    status: 'ready',
    uploadedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    pageCount: 1,
    collectionId: 'col-1',
    collectionName: 'Financials & Quarterly',
    summary: 'Tabular survey feedback across 450 enterprise accounts with NPS score of +68.',
    chunksCount: 45,
    isSample: true,
    extractedText: `Account_ID,Company,Industry,NPS,CSAT,Primary_Use_Case,Status\n101,AcroHealth,Healthcare,10,5,Clinical Trial Retrieval,Active\n102,VertexGlobal,Fintech,9,5,SEC Filing Analysis,Active\n103,OmniLegal,Legal Services,10,5,Contract Discovery,Active\n104,StarlightSaaS,Software,8,4,Technical Spec Search,Active`
  }
]

export const documentService = {
  /**
   * List documents with optional query filters
   */
  async listDocuments(params?: DocumentQueryParams): Promise<DocumentItem[]> {
    try {
      const query = new URLSearchParams()
      if (params?.search) query.set('search', params.search)
      if (params?.type && params.type !== 'all') query.set('type', params.type)
      if (params?.status && params.status !== 'all') query.set('status', params.status)
      if (params?.collectionId) query.set('collectionId', params.collectionId)
      if (params?.sortBy) query.set('sortBy', params.sortBy)
      if (params?.sortOrder) query.set('sortOrder', params.sortOrder)

      const response = await apiClient.get<any[]>(`/documents?${query.toString()}`)
      const rawList = Array.isArray(response.data) ? response.data : []
      if (rawList.length === 0) {
        return SAMPLE_DOCUMENTS
      }
      return rawList.map((d: any) => ({
        id: d.id,
        name: d.name || d.original_filename || 'Untitled Document',
        size: d.size || d.file_size_bytes || 0,
        type: (d.type || d.file_type || 'pdf').toLowerCase(),
        status: d.status || d.processing_status || 'ready',
        uploadedAt: d.uploadedAt || d.uploaded_at || d.created_at || new Date().toISOString(),
        pageCount: d.pageCount ?? d.page_count ?? null,
        chunksCount: d.chunksCount ?? d.chunks_count ?? null,
        collectionId: d.collectionId || d.collection_id || null,
        collectionName: d.collectionName || null,
        summary: d.summary || null,
        extractedText: d.extractedText || d.extracted_text || null,
        error: d.error || d.error_details || null,
        isSample: Boolean(d.isSample),
      }))
    } catch {
      // Return sample demonstration data when backend is not yet running
      return SAMPLE_DOCUMENTS
    }
  },

  /**
   * Get single document by ID
   */
  async getDocument(id: string): Promise<DocumentItem | null> {
    try {
      const response = await apiClient.get<any>(`/documents/${id}`)
      const d = response.data
      if (!d) return null
      return {
        id: d.id,
        name: d.name || d.original_filename || 'Untitled Document',
        size: d.size || d.file_size_bytes || 0,
        type: (d.type || d.file_type || 'pdf').toLowerCase(),
        status: d.status || d.processing_status || 'ready',
        uploadedAt: d.uploadedAt || d.uploaded_at || d.created_at || new Date().toISOString(),
        pageCount: d.pageCount ?? d.page_count ?? null,
        chunksCount: d.chunksCount ?? d.chunks_count ?? null,
        collectionId: d.collectionId || d.collection_id || null,
        collectionName: d.collectionName || null,
        summary: d.summary || null,
        extractedText: d.extractedText || d.extracted_text || null,
        error: d.error || d.error_details || null,
        isSample: Boolean(d.isSample),
      }
    } catch {
      const sample = SAMPLE_DOCUMENTS.find(d => d.id === id)
      return sample || null
    }
  },

  /**
   * Upload document with real XMLHttpRequest progress tracking
   */
  async uploadDocument(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadDocumentResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return (
      await apiClient.uploadFormData<UploadDocumentResponse>(
        '/documents/upload',
        formData,
        onProgress
      )
    ).data
  },

  /**
   * Delete a document
   */
  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/documents/${id}`)
  },

  /**
   * Rename a document
   */
  async renameDocument(id: string, newName: string): Promise<DocumentItem> {
    const res = await apiClient.put<DocumentItem>(`/documents/${id}`, { name: newName })
    return res.data
  },

  /**
   * Trigger re-indexing for a document
   */
  async reprocessDocument(id: string): Promise<void> {
    await apiClient.post(`/documents/${id}/retry`)
  },

  /**
   * Assign document to a collection
   */
  async assignCollection(documentId: string, collectionId: string | null): Promise<void> {
    await apiClient.put(`/documents/${documentId}/collection`, { collectionId })
  }
}

