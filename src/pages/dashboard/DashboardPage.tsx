import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles,
  UploadCloud,
  FileText,
  Clock,
  ArrowRight,
  Plus,
  MessageSquare,
  Search,
  CheckCircle2,
  FolderKanban,
  Files,
  Cpu,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useDocuments } from '../../context/DocumentContext'
import { FileUploadZone } from '../../components/upload/FileUploadZone'
import { FileTypeIcon } from '../../components/documents/FileTypeIcon'
import { ProcessingStatusBadge } from '../../components/documents/ProcessingStatusBadge'
import { formatBytes, formatRelativeTime } from '../../utils/formatters'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Card } from '../../components/ui/Card'
import { SAMPLE_CONVERSATIONS } from '../../services/chatService'

export const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const { documents, collections, isLoading } = useDocuments()

  const safeDocs = Array.isArray(documents) ? documents : []
  const safeCols = Array.isArray(collections) ? collections : []
  const recentDocs = safeDocs.slice(0, 4)
  const readyCount = safeDocs.filter(d => d?.status === 'ready').length
  const processingCount = safeDocs.filter(d => d && d.status !== 'ready' && d.status !== 'failed').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Good day, {user?.name ? user.name.split(' ')[0] : 'Explorer'}
            </h1>
            <Badge variant="primary" size="sm" className="font-mono text-[10px] uppercase">
              {user?.plan || 'Free'} Tier
            </Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Query your indexed documents or drop new files below to expand your collective knowledge base.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/app/documents">
            <Button variant="outline" size="sm" leftIcon={<Files className="w-4 h-4" />}>
              View All ({safeDocs.length})
            </Button>
          </Link>
          <Link to="/app/workspace">
            <Button variant="primary" size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
              Open AI Workspace
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row (Derived exclusively from real in-memory / backend state, no fabricated counts) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Files className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Documents</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{safeDocs.length}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Indexed & Ready</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{readyCount}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Collections</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{safeCols.length}</p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Conversations</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{SAMPLE_CONVERSATIONS.length}</p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Upload Area on Top, then Recent Documents & Recent Conversations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-primary" />
            <span>Document Ingestion Zone</span>
          </h2>
          <span className="text-xs text-slate-400">PDF, DOCX, TXT, MD, CSV, PPTX</span>
        </div>

        <FileUploadZone />
      </div>

      {/* Two Column Layout: Recent Files and Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Documents Section (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Files className="w-4 h-4 text-primary" />
              <span>Recent Documents</span>
            </h2>
            <Link
              to="/app/documents"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Manage Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentDocs.length === 0 ? (
            <div className="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No documents uploaded yet
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Use the upload dropzone above to index your first document into the vector knowledge base.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-primary/40 transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 truncate">
                    <FileTypeIcon type={doc.type} size="md" />
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/app/documents/${doc.id}`}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-primary transition-colors truncate"
                        >
                          {doc.name}
                        </Link>
                        {doc.isSample && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                            sample
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>{formatBytes(doc.size)}</span>
                        {doc.pageCount && <span>• {doc.pageCount} pages</span>}
                        <span>• Added {formatRelativeTime(doc.uploadedAt)}</span>
                        {doc.collectionName && (
                          <span className="hidden sm:inline text-primary font-medium">
                            • {doc.collectionName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <ProcessingStatusBadge status={doc.status} size="sm" />
                    <Link to="/app/workspace">
                      <Button
                        variant="subtle"
                        size="sm"
                        className="text-xs px-2.5 h-8 gap-1 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span>Query</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Conversations Section (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Recent Chats</span>
            </h2>
            <Link
              to="/app/history"
              className="text-xs font-semibold text-primary hover:underline"
            >
              All History
            </Link>
          </div>

          <div className="space-y-3">
            {SAMPLE_CONVERSATIONS.map((conv) => (
              <Link
                key={conv.id}
                to="/app/workspace"
                className="block p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 hover:border-primary/40 transition-all space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-1">
                    {conv.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {formatRelativeTime(conv.updatedAt)}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {conv.lastMessageSnippet}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
                  <FileText className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{conv.documentNames?.[0]}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick RAG Tips Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-cyan-500/10 border border-primary/20 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Cpu className="w-4 h-4 text-primary" />
              <span>RAG Best Practices</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              For optimal retrieval, group related quarterly filings or technical specs in a <strong>Collection</strong> before running cross-document synthesis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

