import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Trash2,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  Bookmark,
  Layers,
  Cpu,
} from 'lucide-react'
import { useDocuments } from '../../context/DocumentContext'
import { DocumentItem } from '../../types'
import { FileTypeIcon } from '../../components/documents/FileTypeIcon'
import { ProcessingStatusBadge } from '../../components/documents/ProcessingStatusBadge'
import { formatBytes, formatDate } from '../../utils/formatters'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

export const DocumentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { documents, deleteDoc, reprocessDoc } = useDocuments()

  const [document, setDocument] = useState<DocumentItem | null>(null)
  const [activeTab, setActiveTab] = useState<'preview' | 'extracted' | 'chunks' | 'metadata'>('preview')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchInDoc, setSearchInDoc] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const found = documents.find((d) => d.id === id)
    if (found) {
      setDocument(found)
    }
  }, [id, documents])

  if (!document) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Document not found
        </h2>
        <p className="text-xs text-slate-400">
          The document with ID "{id}" could not be located in the current repository.
        </p>
        <Link to="/app/documents">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Documents
          </Button>
        </Link>
      </div>
    )
  }

  const totalPages = document.pageCount || 1

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteDoc(document.id)
      navigate('/app/documents')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link
            to="/app/documents"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Back to all documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <FileTypeIcon type={document.type} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate max-w-md">
                {document.name}
              </h1>
              <ProcessingStatusBadge status={document.status} size="sm" />
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              <span>{formatBytes(document.size)}</span>
              <span>• Added {formatDate(document.uploadedAt)}</span>
              {document.collectionName && (
                <span className="text-primary font-medium">• {document.collectionName}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/app/workspace">
            <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              Query in AI Workspace
            </Button>
          </Link>
          <button
            onClick={() => reprocessDoc(document.id)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-cyan-500 transition-colors"
            title="Re-index document vectors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsDeleteOpen(true)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-500 transition-colors"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Document View Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
        tabs={[
          { id: 'preview', label: 'Document Viewer' },
          { id: 'extracted', label: 'Parsed Text Extraction' },
          { id: 'chunks', label: `Vector Chunks (${document.chunksCount || 0})` },
          { id: 'metadata', label: 'Technical Metadata' },
        ]}
      />

      {/* Main Tab Panels */}
      {activeTab === 'preview' && (
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* Viewer Toolbar */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* In-Document Search Bar */}
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Find in document..."
                value={searchInDoc}
                onChange={(e) => setSearchInDoc(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-8 pr-3 py-1 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Document Content Display */}
          <div className="p-8 flex-1 bg-slate-100/50 dark:bg-slate-950/40 flex justify-center overflow-y-auto">
            <div className="w-full max-w-3xl bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg text-slate-800 dark:text-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-mono">
                <span>{document.name} — Page {currentPage}</span>
                <span className="text-emerald-500 font-semibold">Decrypted Blob Stream</span>
              </div>

              <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Executive Brief & Analysis
                </h3>
                <p className="whitespace-pre-line font-sans">
                  {document.extractedText || 'No text extracted for this document.'}
                </p>

                {/* Simulated Citation Highlight Box */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 relative">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary mb-1">
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Evidence Highlight (Relevance 99.2%)</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 italic">
                    "Vector retrieval strictly partitions index queries by tenant_id and document access control lists (ACL) prior to approximate nearest neighbor search."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'extracted' && (
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed shadow-sm">
          {document.extractedText || 'Raw text extraction preview unavailable.'}
        </div>
      )}

      {activeTab === 'chunks' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 shrink-0 text-indigo-500" />
            <span>Semantic chunking has partitioned this document into {document.chunksCount || 0} discrete vector tokens with 1536-dimensional embeddings.</span>
          </div>

          {[1, 2, 3].map((chunkIdx) => (
            <div
              key={chunkIdx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-2"
            >
              <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                <span className="font-bold text-primary">Chunk #{chunkIdx} (Token Span {chunkIdx * 120} - {chunkIdx * 120 + 115})</span>
                <span>Dim: 1536 • Cosine Weight: 0.942</span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                {document.summary || 'Hierarchical semantic chunk representation preserving heading structure and surrounding sentences.'}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'metadata' && (
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <dt className="text-slate-400">File Name</dt>
              <dd className="font-bold text-slate-900 dark:text-white mt-0.5">{document.name}</dd>
            </div>
            <div>
              <dt className="text-slate-400">File Type</dt>
              <dd className="font-mono text-slate-900 dark:text-white uppercase mt-0.5">{document.type}</dd>
            </div>
            <div>
              <dt className="text-slate-400">File Size</dt>
              <dd className="font-mono text-slate-900 dark:text-white mt-0.5">{formatBytes(document.size)}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Pages Count</dt>
              <dd className="font-bold text-slate-900 dark:text-white mt-0.5">{document.pageCount || 1}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Vector Chunks</dt>
              <dd className="font-bold text-slate-900 dark:text-white mt-0.5">{document.chunksCount || 0}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Upload Timestamp</dt>
              <dd className="font-mono text-slate-900 dark:text-white mt-0.5">{document.uploadedAt}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to permanently delete "${document.name}"?`}
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </div>
  )
}

