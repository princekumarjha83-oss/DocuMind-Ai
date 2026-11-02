import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  FolderPlus,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ArrowUpDown,
  FileText,
  UploadCloud,
  Check,
} from 'lucide-react'
import { useDocuments } from '../../context/DocumentContext'
import { DocumentItem, DocumentType, ProcessingStatus } from '../../types'
import { FileTypeIcon } from '../../components/documents/FileTypeIcon'
import { ProcessingStatusBadge } from '../../components/documents/ProcessingStatusBadge'
import { formatBytes, formatDate } from '../../utils/formatters'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { FileUploadZone } from '../../components/upload/FileUploadZone'

export const DocumentsPage: React.FC = () => {
  const {
    documents,
    collections,
    deleteDoc,
    renameDoc,
    reprocessDoc,
  } = useDocuments()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<DocumentType | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<ProcessingStatus | 'all'>('all')
  const [selectedCollection, setSelectedCollection] = useState<string | 'all'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [docToDelete, setDocToDelete] = useState<DocumentItem | null>(null)
  const [docToRename, setDocToRename] = useState<DocumentItem | null>(null)
  const [newNameInput, setNewNameInput] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  // Filtered & Sorted documents
  const filteredDocs = useMemo(() => {
    return documents
      .filter((doc) => {
        const matchesSearch =
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (doc.summary && doc.summary.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchesType = selectedType === 'all' || doc.type === selectedType
        const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus
        const matchesCol =
          selectedCollection === 'all' || doc.collectionId === selectedCollection
        return matchesSearch && matchesType && matchesStatus && matchesCol
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        }
        if (sortBy === 'size') {
          return sortOrder === 'asc' ? a.size - b.size : b.size - a.size
        }
        // date
        return sortOrder === 'asc'
          ? new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          : new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      })
  }, [documents, searchTerm, selectedType, selectedStatus, selectedCollection, sortBy, sortOrder])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDocs.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredDocs.map((d) => d.id))
    }
  }

  const handleDeleteConfirm = async () => {
    if (!docToDelete) return
    setIsDeleting(true)
    try {
      await deleteDoc(docToDelete.id)
      setDocToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRenameConfirm = async () => {
    if (!docToRename || !newNameInput.trim()) return
    await renameDoc(docToRename.id, newNameInput.trim())
    setDocToRename(null)
    setNewNameInput('')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Documents
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage, organize, and inspect all files indexed in your RAG knowledge repository.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload Files
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file name or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as DocumentType | 'all')}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All File Types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="csv">CSV</option>
            <option value="txt">TXT</option>
            <option value="md">Markdown</option>
            <option value="pptx">PPTX</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ProcessingStatus | 'all')}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="ready">Ready</option>
            <option value="indexing">Indexing</option>
            <option value="extracting">Extracting</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
          </select>

          {/* Collection Filter */}
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="all">All Collections</option>
            {collections.map((col) => (
              <option key={col.id} value={col.id}>
                {col.name}
              </option>
            ))}
          </select>
        </div>

        {/* View Switcher & Sorting */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Sort:</span>
            <button
              onClick={() => {
                if (sortBy === 'date') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                else setSortBy('date')
              }}
              className={`px-2 py-1 rounded-lg transition-colors ${
                sortBy === 'date'
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                else setSortBy('name')
              }}
              className={`px-2 py-1 rounded-lg transition-colors ${
                sortBy === 'name'
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Selected Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-between text-xs text-primary font-medium animate-fade-in">
          <span>{selectedIds.length} document(s) selected</span>
          <div className="flex items-center gap-2">
            <Link to="/app/workspace">
              <Button variant="primary" size="sm" className="h-7 text-xs">
                Query Selected ({selectedIds.length})
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-7 text-xs"
            >
              Deselect
            </Button>
          </div>
        </div>
      )}

      {/* Document Content List / Grid */}
      {filteredDocs.length === 0 ? (
        <div className="p-16 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No matching documents found
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, format filters, or upload a new file.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            Upload New File
          </Button>
        </div>
      ) : viewMode === 'list' ? (
        /* List / Table View */
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredDocs.length && filteredDocs.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-slate-300 text-primary w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-4">Name</th>
                  <th className="p-4 hidden sm:table-cell">Collection</th>
                  <th className="p-4 hidden md:table-cell">Size</th>
                  <th className="p-4 hidden md:table-cell">Added</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredDocs.map((doc) => {
                  const isSelected = selectedIds.includes(doc.id)
                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-primary/5' : ''
                      }`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(doc.id)}
                          className="rounded border-slate-300 text-primary w-4 h-4 cursor-pointer"
                        />
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <FileTypeIcon type={doc.type} size="sm" />
                          <div className="truncate max-w-xs sm:max-w-md">
                            <Link
                              to={`/app/documents/${doc.id}`}
                              className="font-bold text-slate-900 dark:text-slate-100 hover:text-primary transition-colors block truncate"
                            >
                              {doc.name}
                            </Link>
                            {doc.pageCount && (
                              <span className="text-[10px] text-slate-400">
                                {doc.pageCount} pages • {doc.chunksCount} chunks
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4 hidden sm:table-cell">
                        {doc.collectionName ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                            {doc.collectionName}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="p-4 hidden md:table-cell font-mono text-slate-500 text-[11px]">
                        {formatBytes(doc.size)}
                      </td>

                      <td className="p-4 hidden md:table-cell text-slate-500 text-[11px]">
                        {formatDate(doc.uploadedAt)}
                      </td>

                      <td className="p-4">
                        <ProcessingStatusBadge status={doc.status} size="sm" />
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/app/documents/${doc.id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Preview Document"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => {
                              setDocToRename(doc)
                              setNewNameInput(doc.name)
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Rename"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => reprocessDoc(doc.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                            title="Reprocess Vector Index"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDocToDelete(doc)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const isSelected = selectedIds.includes(doc.id)
            return (
              <div
                key={doc.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between bg-white dark:bg-slate-900 ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 shadow-md'
                    : 'border-slate-200/80 dark:border-slate-800 hover:border-primary/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <FileTypeIcon type={doc.type} size="md" />
                    <ProcessingStatusBadge status={doc.status} size="sm" />
                  </div>

                  <Link
                    to={`/app/documents/${doc.id}`}
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-primary transition-colors block line-clamp-2"
                  >
                    {doc.name}
                  </Link>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {doc.summary || 'Indexed chunks available for contextual vector retrieval.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{formatBytes(doc.size)}</span>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/app/documents/${doc.id}`}
                      className="p-1 rounded-lg hover:text-primary"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => setDocToDelete(doc)}
                      className="p-1 rounded-lg hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        title="Upload Documents"
        description="Ingest PDFs, Word files, spreadsheets, or markdown notes"
        maxWidth="lg"
      >
        <FileUploadZone
          onFilesSelected={() => {
            setIsUploadOpen(false)
          }}
        />
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={!!docToRename}
        onClose={() => setDocToRename(null)}
        title="Rename Document"
        description="Update the display name of this indexed document"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Input
            label="File Name"
            value={newNameInput}
            onChange={(e) => setNewNameInput(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDocToRename(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRenameConfirm}>
              Save Name
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Document"
        message={`Are you sure you want to permanently remove "${docToDelete?.name}"? Its corresponding chunks and vector embeddings will be pruned from the index.`}
        confirmText="Delete Document"
        isLoading={isDeleting}
      />
    </div>
  )
}

