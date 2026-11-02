import React from 'react'
import { Navbar } from '../../components/layout/Navbar'
import { Footer } from '../../components/layout/Footer'
import { PricingSection } from '../../components/landing/PricingSection'
import { FaqSection } from '../../components/landing/FaqSection'
import { ShieldCheck, Zap, Headphones, CheckCircle2 } from 'lucide-react'

export const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-slate-900 dark:text-slate-100 selection:bg-primary/25 selection:text-white">
      <Navbar />

      <main className="pt-24 pb-16">
        <PricingSection />

        {/* Enterprise Comparison & Support Grid */}
        <section className="py-16 border-t border-slate-200/80 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl sm:text-2xl font-black text-center text-slate-900 dark:text-white mb-12">
              Every plan includes our core verifiable intelligence guarantee
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Zero Data Retention
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your uploaded files, semantic vectors, and prompt history are never written into foundational training sets.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Page-Level Citation Footnotes
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  All synthesized insights reference verifiable document pages, sentence spans, and statistical relevance scores.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Headphones className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Dedicated AI Architect Support
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Access enterprise engineering support for custom RAG chunking pipelines and KMS key management.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FaqSection />
      </main>

      <Footer />
    </div>
  )
}

