import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderKanban,
  Plus,
  Sparkles,
  Trash2,
  Edit2,
  Files,
  ArrowRight,
  FolderOpen,
} from 'lucide-react'
import { useDocuments } from '../../context/DocumentContext'
import { Collection } from '../../types'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { formatDate } from '../../utils/formatters'

export const CollectionsPage: React.FC = () => {
  const { collections, documents, createCollection, deleteCollection } = useDocuments()

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [colToDelete, setColToDelete] = useState<Collection | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#6366F1')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setIsSubmitting(true)
    try {
      await createCollection(name.trim(), description.trim(), color)
      setIsCreateOpen(false)
      setName('')
      setDescription('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!colToDelete) return
    await deleteCollection(colToDelete.id)
    setColToDelete(null)
  }

  const colorOptions = [
    '#6366F1', // Indigo
    '#06B6D4', // Cyan
    '#8B5CF6', // Violet
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Rose
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Collections
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Group related contracts, financial filings, and technical specifications into targeted RAG scopes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Collection
        </Button>
      </div>

      {/* Grid of collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((col) => {
          const docCount = documents.filter((d) => d.collectionId === col.id).length
          return (
            <div
              key={col.id}
              className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: col.color }}
                  >
                    <FolderOpen className="w-5 h-5" />
                  </div>

                  <button
                    onClick={() => setColToDelete(col)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Delete collection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                  {col.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {col.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Files className="w-3.5 h-3.5" />
                    <span>{docCount} document{docCount !== 1 ? 's' : ''}</span>
                  </span>
                  <span>Created {formatDate(col.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/app/documents?collection=${col.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full justify-center text-xs h-8">
                      View Files
                    </Button>
                  </Link>
                  <Link to={`/app/workspace`} className="flex-1">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center text-xs h-8"
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Query Scope
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Collection"
        description="Organize documents into dedicated search domains"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Collection Name"
            placeholder="e.g. M&A Due Diligence 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief description of documents and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-primary ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
              Create Collection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!colToDelete}
        onClose={() => setColToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Collection"
        message={`Are you sure you want to delete "${colToDelete?.name}"? The contained documents will not be deleted, but will be unassigned from this collection.`}
        confirmText="Delete Collection"
      />
    </div>
  )
}

