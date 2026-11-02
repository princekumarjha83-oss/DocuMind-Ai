import React from 'react'
import { motion } from 'framer-motion'
import { Layers, Network, ArrowRight, Check, FileSpreadsheet, FileText, Presentation } from 'lucide-react'
import { Card } from '../ui/Card'

export const MultiDocSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Story */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-semibold">
              <Network className="w-3.5 h-3.5" />
              <span>Multi-Document Synthesis</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Answers across multiple documents at once
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-world decisions are never contained in a single PDF. DocuMind AI connects contracts with financial disclosures, technical specifications with customer survey CSVs, and quarterly slides with audit reports.
            </p>

            <div className="space-y-4 pt-2">
              {[
                'Cross-file entity resolution and timeline reconciliation',
                'Simultaneous query against up to 50 documents per collection',
                'Automated contradiction detection between revisions',
                'Structured summary comparison tables with citation links',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Multi-File Composition */}
          <div className="relative">
            <div className="space-y-3 relative z-10">
              {/* Document 1 Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Q3_Financial_Analysis_Report.pdf
                    </h4>
                    <p className="text-xs text-slate-500">Revenue: $48.6M • Net Retention: 118%</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                  Active Source
                </span>
              </motion.div>

              {/* Connecting Bridge */}
              <div className="flex justify-center -my-1 text-primary">
                <div className="w-0.5 h-6 bg-gradient-to-b from-primary to-indigo-500" />
              </div>

              {/* Document 2 Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Enterprise_Architecture_Security_Spec.docx
                    </h4>
                    <p className="text-xs text-slate-500">AES-256 Envelope Keys • Zero Retention</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                  Active Source
                </span>
              </motion.div>

              {/* Connecting Bridge */}
              <div className="flex justify-center -my-1 text-primary">
                <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-cyan-500" />
              </div>

              {/* Document 3 Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Customer_Success_Quarterly_Survey.csv
                    </h4>
                    <p className="text-xs text-slate-500">450 Enterprise Accounts • NPS +68</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                  Active Source
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

