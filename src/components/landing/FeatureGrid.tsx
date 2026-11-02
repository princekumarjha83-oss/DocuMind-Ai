import React from 'react'
import { motion } from 'framer-motion'
import { FileSearch, Sparkles, Network, Lock, Eye, BookOpen, Cpu, SplitSquareVertical } from 'lucide-react'
import { Card } from '../ui/Card'

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: FileSearch,
      title: 'Hybrid Sparse-Dense Retrieval',
      description: 'Combines exact token BM25 matching with high-dimensional dense vector embeddings to capture nuanced technical terminology and natural phrasing simultaneously.',
      tag: 'Core RAG Engine',
    },
    {
      icon: Network,
      title: 'Multi-Document Cross Synthesis',
      description: 'Ask questions that span dozens of documents simultaneously. The reasoning pipeline merges disparate excerpts into a single cohesive, evidence-backed brief.',
      tag: 'Knowledge Graphs',
    },
    {
      icon: Eye,
      title: 'Traceable Citation Footnotes',
      description: 'Every statement returned includes interactive page and sentence citations. Click any citation chip to inspect the exact passage in the original document viewer.',
      tag: 'Zero Hallucination',
    },
    {
      icon: SplitSquareVertical,
      title: 'Semantic Document Chunking',
      description: 'Unlike naive fixed-character chunking, DocuMind AI analyzes document outlines, headings, tables, and lists to preserve logical context across chunk boundaries.',
      tag: 'Structure-Aware',
    },
    {
      icon: Lock,
      title: 'Tenant-Isolated Vector Namespaces',
      description: 'Strict cryptographic separation ensures your proprietary documents are never co-mingled in vector space and never exposed across organization boundaries.',
      tag: 'SOC 2 Aligned',
    },
    {
      icon: BookOpen,
      title: 'Custom Curated Collections',
      description: 'Group files into project-specific workspaces—such as Financials, M&A Diligence, Legal Audits, or Technical Architecture—with custom retrieval thresholds.',
      tag: 'Workspace Focus',
    },
  ]

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built For Verifiable Precision</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight"
          >
            Everything you need to talk to your documents with conviction
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed"
          >
            No fabricated answers, no lost context, and no blind spots. DocuMind AI indexes your technical, financial, and legal literature with mathematical rigor.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card hover className="h-full p-6 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold border border-slate-200/60 dark:border-slate-700/60">
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2 text-xs font-semibold text-primary">
                  <span>Explore architecture</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

