import React, { useState } from 'react'
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  User,
  Bookmark,
  Share2,
} from 'lucide-react'
import { ChatMessage, Citation } from '../../types'
import { CitationChip } from '../citations/CitationChip'
import { formatTime } from '../../utils/formatters'
import { Badge } from '../ui/Badge'

interface ChatMessageItemProps {
  message: ChatMessage
  onSelectCitation: (citation: Citation) => void
  activeCitationId?: string
  onRetry?: () => void
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onSelectCitation,
  activeCitationId,
  onRetry,
}) => {
  const isAssistant = message.role === 'assistant'
  const [copied, setCopied] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple Markdown formatting helper for paragraphs, lists, bold text, and headers
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n')
    return (
      <div className="space-y-2 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {lines.map((line, idx) => {
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="text-sm font-bold text-slate-900 dark:text-white pt-2">
                {line.replace('### ', '')}
              </h4>
            )
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {line.replace('## ', '')}
              </h3>
            )
          }
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return (
              <li key={idx} className="ml-4 list-disc text-slate-700 dark:text-slate-300">
                {formatInline(line.replace(/^[-•]\s*/, ''))}
              </li>
            )
          }
          if (/^\d+\.\s/.test(line)) {
            return (
              <li key={idx} className="ml-4 list-decimal text-slate-700 dark:text-slate-300">
                {formatInline(line.replace(/^\d+\.\s*/, ''))}
              </li>
            )
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />
          }
          return <p key={idx}>{formatInline(line)}</p>
        })}
      </div>
    )
  }

  const formatInline = (text: string) => {
    // Process bold **text**
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  return (
    <div
      className={`flex items-start gap-3.5 py-4 px-2 sm:px-4 rounded-2xl transition-colors ${
        isAssistant
          ? 'bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80'
          : 'bg-transparent'
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm ${
          isAssistant
            ? 'bg-gradient-to-br from-primary to-accent'
            : 'bg-slate-800 text-slate-200'
        }`}
      >
        {isAssistant ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Message Body */}
      <div className="flex-1 space-y-3 min-w-0">
        {/* Header line with role & timestamp */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              {isAssistant ? 'DocuMind Assistant' : 'You'}
            </span>
            <span className="text-[10px] text-slate-400">
              {formatTime(message.timestamp)}
            </span>
            {message.isSamplePreview && (
              <Badge variant="cyan" size="sm" className="font-mono text-[9px] py-0 px-1.5">
                Demonstration Preview
              </Badge>
            )}
          </div>

          {/* Action buttons (copy, retry, feedback) */}
          {isAssistant && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Copy response"
                aria-label="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setFeedback('positive')}
                className={`p-1 rounded-lg transition-colors ${
                  feedback === 'positive'
                    ? 'text-emerald-500 bg-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Helpful answer"
                aria-label="Thumbs up"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setFeedback('negative')}
                className={`p-1 rounded-lg transition-colors ${
                  feedback === 'negative'
                    ? 'text-rose-500 bg-rose-500/10'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Report issue"
                aria-label="Thumbs down"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              {onRetry && (
                <button
                  onClick={onRetry}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Retry query"
                  aria-label="Retry query"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        {renderFormattedContent(message.content)}

        {/* Sourced Citations Chips */}
        {message.citations && message.citations.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Verified Evidence Sources:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {message.citations.map((cite) => (
                <CitationChip
                  key={cite.id}
                  citation={cite}
                  onClick={onSelectCitation}
                  isActive={activeCitationId === cite.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

