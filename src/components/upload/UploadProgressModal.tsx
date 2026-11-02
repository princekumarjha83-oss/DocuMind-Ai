import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Loader2, X, RefreshCw } from 'lucide-react'
import { useDocuments } from '../../context/DocumentContext'
import { formatBytes } from '../../utils/formatters'
import { FileTypeIcon } from '../documents/FileTypeIcon'
import { Button } from '../ui/Button'

export const UploadProgressModal: React.FC = () => {
  const { activeUploads, removeUpload, clearCompletedUploads } = useDocuments()

  if (activeUploads.length === 0) return null

  const hasCompleted = activeUploads.some(u => u.status === 'success' || u.status === 'error')

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-[calc(100vw-2rem)]">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-4 overflow-hidden"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Document Ingestion Queue ({activeUploads.length})
            </h5>
          </div>
          {hasCompleted && (
            <button
              onClick={clearCompletedUploads}
              className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
            >
              Clear Done
            </button>
          )}
        </div>

        <div className="max-h-60 overflow-y-auto space-y-3 py-3 pr-1">
          <AnimatePresence>
            {activeUploads.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800/80 text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <FileTypeIcon type={item.type} size="sm" />
                    <div className="truncate">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatBytes(item.size)} • {(item.status || 'processing').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {item.status === 'uploading' && (
                      <span className="text-[11px] font-mono text-primary font-bold">
                        {item.progress}%
                      </span>
                    )}
                    {item.status === 'processing' && (
                      <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                    )}
                    {item.status === 'success' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                    <button
                      onClick={() => removeUpload(item.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      item.status === 'error'
                        ? 'bg-rose-500'
                        : item.status === 'success'
                        ? 'bg-emerald-500'
                        : 'bg-primary'
                    }`}
                    style={{ width: `${item.progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

