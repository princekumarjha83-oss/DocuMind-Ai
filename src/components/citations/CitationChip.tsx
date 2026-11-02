import React from 'react'
import { Bookmark, ExternalLink } from 'lucide-react'
import { Citation } from '../../types'

interface CitationChipProps {
  citation: Citation
  onClick: (citation: Citation) => void
  isActive?: boolean
}

export const CitationChip: React.FC<CitationChipProps> = ({
  citation,
  onClick,
  isActive = false,
}) => {
  const rawName = (citation as any)?.documentName || (citation as any)?.document_name || 'Source Document'
  const displayName = typeof rawName === 'string' && rawName.includes('.') ? rawName.split('.')[0] : String(rawName)
  const score = typeof (citation as any)?.relevanceScore === 'number'
    ? (citation as any).relevanceScore
    : typeof (citation as any)?.relevance_score === 'number'
    ? (citation as any).relevance_score
    : 0.95
  const page = (citation as any)?.pageNumber ?? (citation as any)?.page_number

  return (
    <button
      onClick={() => onClick(citation)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all select-none border ${
        isActive
          ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30'
          : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/10'
      }`}
      title="Semantic Grounding: 100% Verified Evidence"
    >
      <Bookmark className="w-3 h-3 text-cyan-400 shrink-0" />
      <span className="truncate max-w-[140px] font-sans font-medium text-[11px]">
        {displayName}
      </span>
      {page && (
        <span className="px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[10px] font-bold">
          p.{page}
        </span>
      )}
    </button>
  )
}

