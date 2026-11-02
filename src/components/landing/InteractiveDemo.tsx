import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, FileText, Send, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

export const InteractiveDemo: React.FC = () => {
  const samplePrompts = [
    'What was our Q3 revenue and year-over-year growth rate?',
    'Explain the tenant vector isolation and cryptographic model.',
    'Compare naive chunking benchmarks against hybrid semantic chunking.',
  ]

  const sampleAnswers: Record<number, { title: string; answer: string; citations: string[]; confidence: string }> = {
    0: {
      title: 'Q3 Financial Performance Synthesis',
      answer: `According to **Q3_Financial_Analysis_Report.pdf (Page 3)**:\n\n• **Total Q3 Revenue**: **$48.6M**, reflecting a **28% YoY increase** driven by enterprise expansion.\n• **Gross Margin**: Expanded **+320 bps** from Q2 to **74.2%**.\n• **Cash Reserves**: Recorded at **$94.2M**, securing operations through Q4 2027.`,
      citations: ['Q3_Financial_Analysis_Report.pdf, Page 3', 'Q3_Financial_Analysis_Report.pdf, Page 8'],
      confidence: '98.4% Match',
    },
    1: {
      title: 'Security Architecture & Vector Isolation',
      answer: `According to **Enterprise_Architecture_Security_Spec.docx (Section 2.1)**:\n\n• **Namespace Partitioning**: Strict metadata pre-filtering by tenant UUID prior to ANN vector traversal.\n• **Encryption Standard**: AES-GCM-256 envelope encryption with KMS-managed rotating customer keys.\n• **Zero Training Retention**: Document tokens are never saved or utilized in model retraining weights.`,
      citations: ['Enterprise_Architecture_Security_Spec.docx, Page 2', 'Enterprise_Architecture_Security_Spec.docx, Page 4'],
      confidence: '99.1% Match',
    },
    2: {
      title: 'Retrieval Benchmark Empirical Results',
      answer: `According to **RAG_Pipeline_Benchmark_Evaluation.pdf (Table 4.2)**:\n\n• **MRR@10**: **+24.3% improvement** with reciprocal rank fusion (BM25 + Dense Vectors).\n• **Hallucination Reduction**: **31% decrease** in unverified facts compared to dense-only embeddings.\n• **Latency Impact**: Reranker adds 38ms overhead while boosting precision-at-1 by 19.4%.`,
      citations: ['RAG_Pipeline_Benchmark_Evaluation.pdf, Page 12', 'RAG_Pipeline_Benchmark_Evaluation.pdf, Page 15'],
      confidence: '97.2% Match',
    },
  }

  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="cyan" className="mb-4">
            Interactive Product Preview
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            See DocuMind AI in action
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Click sample enterprise queries below to preview real multi-document synthesis and page-level source attribution.
          </p>
          <p className="mt-1 text-xs text-amber-500 font-mono">
            [Sample Demonstration Preview — All answers cite verified demonstration documents]
          </p>
        </div>

        {/* Demo Interface Card */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Prompt Selector */}
          <div className="lg:col-span-5 p-6 sm:p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Select a demonstration query
                </span>
              </div>

              <div className="space-y-3">
                {samplePrompts.map((prompt, idx) => (
                  <button
                    key={prompt}
                    onClick={() => setActiveIndex(idx)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                      activeIndex === idx
                        ? 'border-primary bg-primary/10 shadow-sm text-slate-900 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-sm font-medium leading-snug">{prompt}</span>
                    <ChevronRight
                      className={`w-4 h-4 shrink-0 mt-0.5 transition-transform ${
                        activeIndex === idx ? 'text-primary translate-x-0.5' : 'text-slate-400'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300">
              <div className="flex items-center gap-2 font-semibold mb-1">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Multi-Document Grounding</span>
              </div>
              <span>Answers are restricted to the selected document collection with automatic conflict resolution.</span>
            </div>
          </div>

          {/* Right: Synthesis & Citations Display */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Query Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-bold">
                      Answer Synthesis
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {sampleAnswers[activeIndex].title}
                    </h3>
                  </div>
                  <Badge variant="cyan" size="sm" className="font-mono">
                    {sampleAnswers[activeIndex].confidence}
                  </Badge>
                </div>

                {/* Markdown content */}
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                  {sampleAnswers[activeIndex].answer}
                </div>

                {/* Sourced Citations */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <BookOpen className="w-3.5 h-3.5 text-primary" />
                    <span>Verified Source Citations</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sampleAnswers[activeIndex].citations.map((cite) => (
                      <span
                        key={cite}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-primary/50 cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        {cite}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Inference latency: 142ms</span>
              <span className="font-mono">Model: RAG Cross-Encoder v2</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

