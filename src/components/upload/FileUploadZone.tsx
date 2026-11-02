import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { validateDocumentFile, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES } from '../../utils/validators'
import { formatBytes } from '../../utils/formatters'
import { useDocuments } from '../../context/DocumentContext'

interface FileUploadZoneProps {
  onFilesSelected?: (files: File[]) => void
  compact?: boolean
  className?: string
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  compact = false,
  className = '',
}) => {
  const { addUploads } = useDocuments()
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [stagedFiles, setStagedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProcessFiles = useCallback((files: FileList | File[]) => {
    const validList: File[] = []
    const errors: string[] = []

    Array.from(files).forEach((file) => {
      const result = validateDocumentFile(file)
      if (!result.valid) {
        errors.push(`${file.name}: ${result.error}`)
      } else {
        // Check duplicate in staged
        if (stagedFiles.some(f => f.name === file.name && f.size === file.size)) {
          errors.push(`${file.name}: Duplicate file already selected.`)
        } else {
          validList.push(file)
        }
      }
    })

    if (errors.length > 0) {
      setValidationErrors(errors)
    } else {
      setValidationErrors([])
    }

    if (validList.length > 0) {
      setStagedFiles(prev => [...prev, ...validList])
    }
  }, [stagedFiles])

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFiles(e.dataTransfer.files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeStagedFile = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleStartUpload = () => {
    if (stagedFiles.length === 0) return
    if (onFilesSelected) {
      onFilesSelected(stagedFiles)
    } else {
      addUploads(stagedFiles)
    }
    setStagedFiles([])
    setValidationErrors([])
  }

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Drag & Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 ${
          isDragOver
            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.005]'
            : 'border-slate-300/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-primary/50 hover:bg-primary/5'
        } ${compact ? 'p-6' : 'p-10'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt,.md,.csv,.pptx"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleProcessFiles(e.target.files)
          }}
        />

        <div className="flex flex-col items-center justify-center text-center">
          <motion.div
            animate={{ y: isDragOver ? -4 : 0 }}
            className="w-14 h-14 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
          >
            <UploadCloud className="w-7 h-7" />
          </motion.div>

          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {isDragOver ? 'Drop your documents here' : 'Drop documents here or click to browse'}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Supported formats: {ALLOWED_EXTENSIONS.map(ext => ext.toUpperCase()).join(', ')} (Max {formatBytes(MAX_FILE_SIZE_BYTES)})
          </p>

          <div className="mt-4 flex items-center gap-2">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              Vectorized Chunking
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              Private ACL
            </span>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              Hybrid Index
            </span>
          </div>
        </div>
      </div>

      {/* Validation Errors */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-500 dark:text-rose-400 space-y-1"
          >
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Validation Issues</span>
            </div>
            {validationErrors.map((err, idx) => (
              <p key={idx} className="pl-5 text-slate-600 dark:text-slate-300">
                • {err}
              </p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Staged files ready to process */}
      <AnimatePresence>
        {stagedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''} queued for upload
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStagedFiles([])}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear All
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {stagedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                      {file.name}
                    </span>
                    <span className="text-slate-400 text-[11px] shrink-0">
                      ({formatBytes(file.size)})
                    </span>
                  </div>
                  <button
                    onClick={() => removeStagedFile(idx)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStagedFiles([])}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleStartUpload}
                leftIcon={<UploadCloud className="w-4 h-4" />}
              >
                Upload & Vector Index ({stagedFiles.length})
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

