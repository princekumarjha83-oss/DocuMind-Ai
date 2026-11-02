import React from 'react'
import { motion } from 'framer-motion'
import { UploadCloud, Search, BrainCircuit, MessageSquareText, ArrowRight } from 'lucide-react'

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Upload Documents',
      description: 'Ingest PDFs, Word files, spreadsheets, or markdown notes via our high-throughput drag-and-drop parser.',
      icon: UploadCloud,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      num: '02',
      title: 'Semantic Retrieval',
      description: 'Documents are structured into semantic chunks and embedded into high-dimensional vector space with hybrid BM25 scoring.',
      icon: Search,
      color: 'from-indigo-500 to-violet-500',
    },
    {
      num: '03',
      title: 'Context Understanding',
      description: 'Our cross-encoder reranker analyzes relevant passages against your prompt, eliminating false positives and noise.',
      icon: BrainCircuit,
      color: 'from-violet-500 to-purple-500',
    },
    {
      num: '04',
      title: 'Evidence-Backed Answer',
      description: 'Receive synthesized intelligence with interactive footnotes, confidence scores, and direct page-level citations.',
      icon: MessageSquareText,
      color: 'from-purple-500 to-cyan-500',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">
            The Intelligence Pipeline
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            From raw files to verified answers in seconds
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            A 4-stage retrieval-augmented generation engine engineered for zero hallucinations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative flex flex-col p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-2xl font-black font-mono text-slate-300 dark:text-slate-700">
                  {step.num}
                </span>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md shadow-primary/20`}>
                  <step.icon className="w-6 h-6" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.description}
              </p>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-10 text-slate-400 dark:text-slate-600">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

