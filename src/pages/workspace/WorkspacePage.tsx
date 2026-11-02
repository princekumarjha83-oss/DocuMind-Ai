import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Send,
  Plus,
  Paperclip,
  Bookmark,
  CheckCircle2,
  Square,
  RefreshCw,
  FolderOpen,
  Check,
  ChevronDown,
  Layers,
  HelpCircle,
  AlertCircle,
  FileText,
  SlidersHorizontal,
} from 'lucide-react'
import { useDocuments } from '../../context/DocumentContext'
import { ChatMessage, Citation } from '../../types'
import { chatService, SAMPLE_CHAT_MESSAGES } from '../../services/chatService'
import { ChatMessageItem } from '../../components/chat/ChatMessageItem'
import { StreamingTypingIndicator } from '../../components/chat/StreamingTypingIndicator'
import { SourceDrawer } from '../../components/citations/SourceDrawer'
import { FileTypeIcon } from '../../components/documents/FileTypeIcon'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'

export const WorkspacePage: React.FC = () => {
  const { documents, selectedDocIds, toggleSelectDoc, selectAllDocs, clearSelectedDocs } = useDocuments()

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_CHAT_MESSAGES['conv-1'] || [])
  const [inputText, setInputText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null)
  const [isSourcePanelOpen, setIsSourcePanelOpen] = useState(true)
  const [isDocSelectorOpen, setIsDocSelectorOpen] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const selectedDocuments = documents.filter(d => selectedDocIds.includes(d.id))

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming])

  // Handle Send Question
  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputText).trim()
    if (!question || isStreaming) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsStreaming(true)

    try {
      const response = await chatService.sendMessage({
        documentIds: selectedDocIds.length > 0 ? selectedDocIds : documents.map(d => d.id),
        message: question,
      })

      setMessages(prev => [...prev, response.message])
      setIsStreaming(false)
      if (response.message.citations && response.message.citations.length > 0) {
        setActiveCitation(response.message.citations[0])
        setIsSourcePanelOpen(true)
      }
    } catch (err: any) {
      setIsStreaming(false)
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `**Error:** ${err?.message || 'Unable to retrieve answer from AI service. Please ensure documents are uploaded and processed.'}`,
        timestamp: new Date().toISOString(),
        status: 'error',
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleStartNewChat = () => {
    setMessages([])
    setActiveCitation(null)
  }

  const handleSelectCitation = (citation: Citation) => {
    setActiveCitation(citation)
    setIsSourcePanelOpen(true)
  }

  const suggestedPrompts = [
    'Summarize key revenue growth metrics in this document',
    'Find security and cryptographic encryption controls',
    'Compare selected documents and identify core differences',
  ]

  const activeDocForCitation = activeCitation
    ? documents.find(d => d.id === activeCitation.documentId)
    : null

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row overflow-hidden bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100">
      {/* Left Panel: Document Selection Library */}
      <div
        className={`w-full lg:w-72 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-dark-surface/95 flex flex-col shrink-0 ${
          isDocSelectorOpen ? 'block' : 'hidden lg:block'
        }`}
      >
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-primary" />
              <span>Target Documents ({selectedDocIds.length})</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Select files for RAG grounding</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (selectedDocIds.length === documents.length) {
                  clearSelectedDocs()
                } else {
                  selectAllDocs(documents.map(d => d.id))
                }
              }}
              className="text-[11px] text-primary hover:underline font-medium"
            >
              {selectedDocIds.length === documents.length ? 'Clear' : 'All'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {documents.map((doc) => {
            const isSelected = selectedDocIds.includes(doc.id)
            return (
              <div
                key={doc.id}
                onClick={() => toggleSelectDoc(doc.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2.5 select-none ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-xs'
                    : 'border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <FileTypeIcon type={doc.type} size="sm" />
                  <div className="truncate">
                    <p className={`font-semibold truncate ${isSelected ? 'text-primary dark:text-primary-300' : 'text-slate-800 dark:text-slate-200'}`}>
                      {doc.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {doc.chunksCount ? `${doc.chunksCount} chunks` : 'Indexed'}
                    </p>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected count footer */}
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 flex items-center justify-between">
          <span>{selectedDocIds.length} of {documents.length} files active</span>
          <span className="font-mono text-emerald-500 font-bold">Hybrid RAG</span>
        </div>
      </div>

      {/* Center: Conversation View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/40 dark:bg-dark-bg">
        {/* Workspace Action Bar */}
        <div className="h-14 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-dark-surface/70 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Active Query Session
            </span>
            <Badge variant="cyan" size="sm" className="font-mono text-[10px]">
              {selectedDocuments.length} Active Document{selectedDocuments.length > 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartNewChat}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              className="text-xs h-8 px-2.5"
            >
              New Chat
            </Button>

            <button
              onClick={() => setIsSourcePanelOpen(!isSourcePanelOpen)}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                isSourcePanelOpen
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500'
              }`}
              title="Toggle Evidence Panel"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Evidence Drawer</span>
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Demonstration Notice */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                <strong>Demonstration Preview Mode:</strong> Interactive queries generate structured synthesized answers with sample source verification. Full backend RAG integration connects in Prompt 3.
              </span>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 space-y-6">
              <div className="w-14 h-14 rounded-3xl bg-primary/10 text-primary flex items-center justify-center shadow-lg shadow-primary/10">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Ask your documents anything
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Select a document from the left and ask questions. Every response includes direct page and sentence citations.
                </p>
              </div>

              {/* Suggestions */}
              <div className="w-full space-y-2 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Suggested Prompts:
                </span>
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-primary/40 hover:bg-primary/5 transition-all text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-2"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onSelectCitation={handleSelectCitation}
                activeCitationId={activeCitation?.id}
                onRetry={() => handleSendMessage('Summarize key points')}
              />
            ))
          )}

          {isStreaming && <StreamingTypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-dark-surface shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all p-2.5">
              <textarea
                ref={textareaRef}
                rows={2}
                placeholder={
                  selectedDocIds.length > 0
                    ? `Ask anything about ${selectedDocuments.map(d => d.name).join(', ')}... (Shift+Enter for newline)`
                    : 'Select at least one document from the left library to ask questions...'
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                className="w-full bg-transparent resize-none text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none pr-12"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span className="font-mono">Enter</span> to send • <span className="font-mono">Shift+Enter</span> for newline
                </div>

                <div className="flex items-center gap-2">
                  {isStreaming ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsStreaming(false)}
                      leftIcon={<Square className="w-3.5 h-3.5" />}
                      className="text-xs h-8 px-3"
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || selectedDocIds.length === 0}
                      rightIcon={<Send className="w-3.5 h-3.5" />}
                      className="text-xs h-8 px-3.5"
                    >
                      Ask AI
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Source Evidence Viewer */}
      {isSourcePanelOpen && activeCitation && (
        <div className="w-full lg:w-96 shrink-0 h-full">
          <SourceDrawer
            citation={activeCitation}
            document={activeDocForCitation}
            onClose={() => setIsSourcePanelOpen(false)}
            isOpen={isSourcePanelOpen}
          />
        </div>
      )}
    </div>
  )
}

