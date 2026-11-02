import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Bookmark, ExternalLink, Quote, Sparkles } from 'lucide-react'
import { Badge } from '../ui/Badge'

export const EvidenceVerification: React.FC = () => {
  const [selectedCitation, setSelectedCitation] = useState<number>(0)

  const citations = [
    {
      doc: 'Q3_Financial_Analysis_Report.pdf',
      page: 3,
      section: 'Section 1.2 — Revenue Performance',
      passage: 'Total revenue for Q3 achieved $48.6M, representing a 28% year-over-year increase driven by strong enterprise subscription adoption and enterprise retention rate of 118%.',
      claim: 'Q3 revenue hit $48.6M (+28% YoY) with 118% net retention.',
      confidence: '99.4%',
    },
    {
      doc: 'Enterprise_Architecture_Security_Spec.docx',
      page: 2,
      section: 'Section 3.4 — Multi-Tenant Partitioning',
      passage: 'Vector retrieval strictly partitions index queries by tenant_id and document access control lists (ACL) prior to approximate nearest neighbor search.',
      claim: 'Tenants are strictly partitioned by ID and ACL prior to vector query.',
      confidence: '98.8%',
    },
  ]

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="primary" className="mb-4">
            Auditable Evidence
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Every answer backed by interactive citations
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Never wonder whether an AI synthesized fact is genuine. Inspect the original page, sentence, and confidence score with one click.
          </p>
        </div>

        {/* Verification Stage Box */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left: AI Claim with Citation Footnote */}
          <div className="p-8 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Generated Synthesis & Footnote
              </span>
              <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <Quote className="w-6 h-6 text-primary/40 mb-2" />
                <p className="text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                  "{citations[selectedCitation].claim}"
                  <button
                    onClick={() => {}}
                    className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-md bg-primary/20 text-primary font-mono text-xs font-bold hover:bg-primary/30 transition-colors"
                  >
                    [Page {citations[selectedCitation].page}]
                  </button>
                </p>
              </div>

              <div className="mt-6 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Select Citation Scenario:
                </p>
                <div className="flex gap-2">
                  {citations.map((c, i) => (
                    <button
                      key={c.doc}
                      onClick={() => setSelectedCitation(i)}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all ${
                        selectedCitation === i
                          ? 'border-primary bg-primary/10 text-primary font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {c.doc.split('_')[0]} Sample
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Grounding Verification Score: {citations[selectedCitation].confidence}</span>
            </div>
          </div>

          {/* Right: Actual Document Page Viewer Mockup with Highlighted Evidence */}
          <div className="p-8 bg-slate-900 text-slate-100 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    {citations[selectedCitation].doc}
                  </span>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Page {citations[selectedCitation].page}
                </span>
              </div>

              <div className="mt-4 text-xs font-mono text-slate-400">
                {citations[selectedCitation].section}
              </div>

              {/* The Highlighted Passage */}
              <div className="mt-4 p-4 rounded-xl border border-primary/40 bg-primary/15 relative">
                <div className="absolute -left-1 top-2 bottom-2 w-1 bg-primary rounded-full" />
                <p className="text-sm font-sans text-white leading-relaxed font-medium">
                  {citations[selectedCitation].passage}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
              <span>Verified against encrypted immutable blob storage</span>
              <span className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
                <span>View Full Page</span>
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

