import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, BrainCircuit } from 'lucide-react'

export const StreamingTypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-lg">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 animate-spin" />
      </div>

      <div className="space-y-1.5 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            DocuMind AI
          </span>
          <span className="text-[10px] font-mono text-cyan-500 bg-cyan-500/10 px-1.5 py-0.2 rounded-md">
            Synthesizing chunks...
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
            className="w-2 h-2 rounded-full bg-primary"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
            className="w-2 h-2 rounded-full bg-indigo-500"
          />
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
            className="w-2 h-2 rounded-full bg-cyan-400"
          />
        </div>
      </div>
    </div>
  )
}

