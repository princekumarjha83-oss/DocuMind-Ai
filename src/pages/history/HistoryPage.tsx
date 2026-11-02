import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  History,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  FileText,
  Clock,
} from 'lucide-react'
import { Conversation } from '../../types'
import { SAMPLE_CONVERSATIONS, chatService } from '../../services/chatService'
import { formatRelativeTime } from '../../utils/formatters'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

export const HistoryPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(SAMPLE_CONVERSATIONS)
  const [searchTerm, setSearchTerm] = useState('')
  const [convToDelete, setConvToDelete] = useState<Conversation | null>(null)
  const [convToRename, setConvToRename] = useState<Conversation | null>(null)
  const [newTitle, setNewTitle] = useState('')

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.lastMessageSnippet && c.lastMessageSnippet.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleDelete = async () => {
    if (!convToDelete) return
    await chatService.deleteConversation(convToDelete.id)
    setConversations((prev) => prev.filter((c) => c.id !== convToDelete.id))
    setConvToDelete(null)
  }

  const handleRename = () => {
    if (!convToRename || !newTitle.trim()) return
    setConversations((prev) =>
      prev.map((c) => (c.id === convToRename.id ? { ...c, title: newTitle.trim() } : c))
    )
    setConvToRename(null)
    setNewTitle('')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Conversation History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review previous synthesis sessions and reopen discussions across your documents.
          </p>
        </div>

        <Link to="/app/workspace">
          <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
            New Session
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by topic, summary snippet, or document title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary"
        />
      </div>

      {/* List */}
      {filteredConversations.length === 0 ? (
        <div className="p-16 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-center space-y-3">
          <History className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No conversations match your search
          </h3>
          <p className="text-xs text-slate-400">
            Start a new session in the AI Workspace to synthesize answers from your documents.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                  <Link
                    to="/app/workspace"
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-primary transition-colors truncate"
                  >
                    {conv.title}
                  </Link>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                  {conv.lastMessageSnippet}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatRelativeTime(conv.updatedAt)}</span>
                  </span>
                  {conv.documentNames && conv.documentNames[0] && (
                    <span className="flex items-center gap-1 font-mono">
                      <FileText className="w-3 h-3" />
                      <span className="truncate">{conv.documentNames[0]}</span>
                    </span>
                  )}
                  <span>• {conv.messageCount} messages</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <Link to="/app/workspace">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Resume
                  </Button>
                </Link>

                <button
                  onClick={() => {
                    setConvToRename(conv)
                    setNewTitle(conv.title)
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Rename session"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setConvToDelete(conv)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Delete conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rename Modal */}
      <Modal
        isOpen={!!convToRename}
        onClose={() => setConvToRename(null)}
        title="Rename Session"
        description="Update the conversation title"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConvToRename(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRename}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!convToDelete}
        onClose={() => setConvToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Conversation"
        message={`Are you sure you want to delete "${convToDelete?.title}"? All chat history and citation links for this thread will be removed.`}
        confirmText="Delete Conversation"
      />
    </div>
  )
}

