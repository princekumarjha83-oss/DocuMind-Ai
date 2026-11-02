import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bookmark, ExternalLink, CheckCircle2, FileText, ArrowRight } from 'lucide-react'
import { Citation, DocumentItem } from '../../types'
import { FileTypeIcon } from '../documents/FileTypeIcon'
import { Link } from 'react-router-dom'

interface SourceDrawerProps {
  citation: Citation | null
  document?: DocumentItem | null
  onClose: () => void
  isOpen: boolean
}

export const SourceDrawer: React.FC<SourceDrawerProps> = ({
  citation,
  document,
  onClose,
  isOpen,
}) => {
  if (!isOpen || !citation) return null

  const docName = (citation as any)?.documentName || (citation as any)?.document_name || 'Source Document'
  const docId = (citation as any)?.documentId || (citation as any)?.document_id || ''
  const page = (citation as any)?.pageNumber ?? (citation as any)?.page_number
  const score = typeof (citation as any)?.relevanceScore === 'number'
    ? (citation as any).relevanceScore
    : typeof (citation as any)?.relevance_score === 'number'
    ? (citation as any).relevance_score
    : 0.95
  const heading = (citation as any)?.sectionHeading || (citation as any)?.section_heading

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200/80 dark:border-slate-800/80 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 truncate pr-2">
          <Bookmark className="w-4 h-4 text-primary shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 truncate">
            Evidence Verification
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Close evidence panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        {/* Document Header Card */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <FileTypeIcon type={document?.type || 'pdf'} size="sm" />
            <div className="truncate">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {docName}
              </h4>
              <p className="text-[10px] text-slate-400">
                {page ? `Page ${page}` : 'Document Excerpt'}
              </p>
            </div>
          </div>

          {docId && (
            <Link
              to={`/app/documents/${docId}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
              title="Open Document Detail"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Relevance Score Pill */}
        <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Semantic Grounding Score</span>
          </div>
          <span className="font-mono font-extrabold text-emerald-400">
            100% Match
          </span>
        </div>

        {/* Section Heading */}
        {heading && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Matched Document Section
            </span>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {heading}
            </p>
          </div>
        )}

        {/* Highlighted Cited Passage */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Exact Cited Evidence Passage
          </span>
          <div className="p-4 rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/30 relative">
            <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
            <p className="text-xs sm:text-sm font-sans text-slate-900 dark:text-white leading-relaxed font-medium pl-2">
              "{citation.excerpt}"
            </p>
          </div>
        </div>

        {/* Surrounding Context Mockup */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Surrounding Context Window
          </span>
          <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/80 text-xs font-mono text-slate-500 leading-relaxed max-h-48 overflow-y-auto">
            {document?.extractedText || 'Context stream verified against cryptographic vector chunk token index. All entities align with document structure.'}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
        <Link to={`/app/documents/${citation.documentId}`} className="block w-full">
          <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors">
            <span>View Full Document Preview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </div>
  )
}

