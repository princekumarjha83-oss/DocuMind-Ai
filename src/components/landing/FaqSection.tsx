import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { Badge } from '../ui/Badge'

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How does DocuMind AI eliminate hallucinations?',
      a: 'DocuMind AI uses a strict Retrieval-Augmented Generation (RAG) architecture. Rather than relying on a model\'s parametric training memory, the system retrieves exact document passages using hybrid BM25 and dense vector search, reranks them through a cross-encoder, and constrains the reasoning model to answer solely using the verified retrieved context. Any claim without supporting evidence is omitted or explicitly tagged as unverified.',
    },
    {
      q: 'Are my uploaded files or queries used to train AI models?',
      a: 'Never. All customer data is processed under zero-data-retention terms. Customer files, extracted text, embeddings, and conversation histories are never utilized for model training, public fine-tuning, or collective intelligence sharing. Your workspace vectors are cryptographically isolated.',
    },
    {
      q: 'What file formats can I upload today?',
      a: 'Currently, DocuMind AI natively parses PDF (.pdf), Word documents (.docx), plain text (.txt), Markdown (.md), tabular data (.csv), and presentations (.pptx). Scanned image-only PDFs require OCR extraction support from our enterprise pipeline.',
    },
    {
      q: 'What is hybrid sparse-dense retrieval and why does it matter?',
      a: 'Standard vector search often struggles with precise numbers, product codes, or legal clause identifiers (e.g. "Section 4.1.2(b)"). Hybrid retrieval combines BM25 token-exact matching with 1536-dimensional dense neural embeddings using Reciprocal Rank Fusion (RRF). This ensures you capture both conceptual intent and exact technical terminology.',
    },
    {
      q: 'Can I query across dozens of files simultaneously?',
      a: 'Yes! You can organize files into Collections (e.g. "Q3 Board Audit" or "Legal Contracts") and query the entire collection at once. The engine synthesizes answers across documents while attributing individual statements to their specific source file and page.',
    },
    {
      q: 'How does the interactive citation verification work?',
      a: 'Every answer returned features clickable footnote chips. Clicking any chip opens the integrated evidence drawer or document viewer, highlights the exact sentence in the original document, and reveals the relevance score assigned by the reranker.',
    },
  ]

  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-white/5 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="primary" className="mb-4">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clear answers to common questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Everything you need to know about our document intelligence architecture.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-6 flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 mt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

