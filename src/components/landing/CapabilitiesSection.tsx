import React from 'react'
import { motion } from 'framer-motion'
import { Zap, ShieldCheck, Database, Layers, CheckCircle } from 'lucide-react'

export const CapabilitiesSection: React.FC = () => {
  const capabilities = [
    {
      icon: Database,
      value: '6 Formats',
      label: 'Native Ingestion',
      subtext: 'PDF, DOCX, TXT, MD, CSV, PPTX',
    },
    {
      icon: Zap,
      value: '< 180ms',
      label: 'Vector Retrieval',
      subtext: 'Hybrid BM25 + dense ranking',
    },
    {
      icon: Layers,
      value: '100% Sourced',
      label: 'Verifiable Evidence',
      subtext: 'Page-level citation highlights',
    },
    {
      icon: ShieldCheck,
      value: 'Zero Retention',
      label: 'Privacy Guarantee',
      subtext: 'No model training on your data',
    },
  ]

  return (
    <section className="py-12 border-y border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-8">
          Architected for enterprise accuracy and zero hallucination tolerance
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {capabilities.map((cap, i) => (
            <motion.div
              key={cap.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center sm:items-start text-center sm:text-left p-4 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <cap.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {cap.value}
              </div>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {cap.label}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {cap.subtext}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

