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

  // Professional Markdown formatting with table, list, header, and inline styling
  const renderFormattedContent = (content: string) => {
    const rawLines = content.split('\n')
    const blocks: React.ReactNode[] = []
    let i = 0

    while (i < rawLines.length) {
      const line = rawLines[i]

      // 1. Table block (lines starting and ending with |)
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const tableLines: string[] = []
        while (i < rawLines.length && rawLines[i].trim().startsWith('|') && rawLines[i].trim().endsWith('|')) {
          tableLines.push(rawLines[i].trim())
          i++
        }

        // Parse rows, filtering out markdown separator |---|---|
        const parsedRows = tableLines
          .filter(tl => !/^[|\s:-]+$/.test(tl))
          .map(tl => tl.split('|').slice(1, -1).map(c => c.trim()))

        if (parsedRows.length > 0) {
          const headerRow = parsedRows[0]
          const bodyRows = parsedRows.slice(1)
          blocks.push(
            <div key={`tbl-${i}`} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    {headerRow.map((h, hIdx) => (
                      <th key={hIdx} className="px-3.5 py-2.5 font-bold">{formatInline(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 bg-white dark:bg-slate-900/40">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3.5 py-2.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                          {formatInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        continue
      }

      // 2. Blockquotes
      if (line.startsWith('> ') || line === '>') {
        const quoteText = line.replace(/^>\s*/, '')
        blocks.push(
          <blockquote key={`bq-${i}`} className="pl-3.5 border-l-2 border-primary/60 italic text-slate-600 dark:text-slate-400 my-2">
            {formatInline(quoteText)}
          </blockquote>
        )
        i++
        continue
      }

      // 3. Headers
      if (line.startsWith('### ')) {
        blocks.push(
          <h4 key={`h4-${i}`} className="text-sm font-bold text-slate-900 dark:text-white pt-2.5 pb-0.5">
            {formatInline(line.replace('### ', ''))}
          </h4>
        )
        i++
        continue
      }
      if (line.startsWith('## ')) {
        blocks.push(
          <h3 key={`h3-${i}`} className="text-base font-bold text-slate-900 dark:text-white pt-3 pb-1">
            {formatInline(line.replace('## ', ''))}
          </h3>
        )
        i++
        continue
      }

      // 4. Bullet lists
      if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
        blocks.push(
          <li key={`li-${i}`} className="ml-4 list-disc text-slate-700 dark:text-slate-300 leading-relaxed">
            {formatInline(line.replace(/^[-•*]\s*/, ''))}
          </li>
        )
        i++
        continue
      }

      // 5. Numbered lists
      if (/^\d+\.\s/.test(line)) {
        blocks.push(
          <li key={`num-${i}`} className="ml-4 list-decimal text-slate-700 dark:text-slate-300 leading-relaxed">
            {formatInline(line.replace(/^\d+\.\s*/, ''))}
          </li>
        )
        i++
        continue
      }

      // 6. Empty line spacer
      if (line.trim() === '') {
        blocks.push(<div key={`sp-${i}`} className="h-1.5" />)
        i++
        continue
      }

      // 7. Normal paragraph
      blocks.push(
        <p key={`p-${i}`} className="leading-relaxed">
          {formatInline(line)}
        </p>
      )
      i++
    }

    return (
      <div className="space-y-1.5 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
        {blocks}
      </div>
    )
  }

  const formatInline = (text: string) => {
    // Process bold (**text**), code (`text`), and italic (*text*)
    const tokenRegex = /(\*\*.*?\*\*|`.*?`|\*[^*\n]+?\*)/g
    const parts = text.split(tokenRegex)

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={i} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-primary text-xs font-mono">
            {part.slice(1, -1)}
          </code>
        )
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={i} className="italic text-slate-700 dark:text-slate-300">
            {part.slice(1, -1)}
          </em>
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

